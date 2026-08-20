import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { NotFound } from "src/common/errors/domain.errors";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";
import type { User } from "src/domain/user.entity";

const listQuerySchema = z.object({
  status: z
    .enum([
      "draft",
      "pendingapproval",
      "rejected",
      "active",
      "paused",
      "taken",
      "expired",
      "suspended",
    ])
    .optional(),
  ownerId: z.string().optional(),
  citySlug: z.string().optional(),
  query: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "oldest", "rentlow", "renthigh"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const editSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(1500).optional(),
  rentPaise: z.number().int().min(50_000).max(100_000_000).optional(),
  depositPaise: z.number().int().min(0).max(500_000_000).optional(),
  availableFrom: z.string().date().optional(),
  reason: z.string().trim().min(5).max(500),
});

/**
 * Listing records for the console: read everything, correct anything, remove
 * what should not exist.
 *
 * Status changes deliberately do not live here — they go through
 * /superadmin/approvals, which enforces the lifecycle table and writes the
 * approval trail. A PATCH that could also set status would let the console
 * sidestep both.
 */
@Controller("superadmin/listings")
@SuperAdminOnly()
export class AdminListingsController {
  constructor(
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
    @Inject(GEOGRAPHY_REPOSITORY)
    private readonly geography: GeographyRepository,
  ) {}

  /** Every listing, any status. */
  @Get()
  async list(
    @Query(new ZodValidationPipe(listQuerySchema))
    query: z.infer<typeof listQuerySchema>,
  ) {
    const page = await this.listings.findForAdmin({
      statuses: query.status ? [query.status] : undefined,
      ownerId: query.ownerId,
      citySlug: query.citySlug,
      query: query.query,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });

    // One batched owner lookup rather than one per row.
    const [owners, cities, localities] = await Promise.all([
      this.users.findManyByIds(page.items.map((listing) => listing.ownerId)),
      this.geography.findCitiesByIds(page.items.map((listing) => listing.cityId)),
      this.geography.findLocalitiesByIds(page.items.map((listing) => listing.localityId)),
    ]);

    return {
      ...page,
      items: page.items.map((listing) => ({
        listing: {
          ...listing,
          city: cities.get(listing.cityId) ?? null,
          locality: localities.get(listing.localityId) ?? null,
        },
        ownerName: owners.get(listing.ownerId)?.name ?? "Unknown",
        ownerId: listing.ownerId,
      })),
    };
  }

  /** Counts per status, for the dashboard tiles and the filter chips. */
  @Get("counts")
  async counts() {
    return this.listings.countByStatus();
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFound("Listing");

    const [owner, reportCount, city, locality] = await Promise.all([
      this.users.findById(listing.ownerId),
      this.reports.countForTarget("listing", id),
      this.geography.findCityById(listing.cityId),
      this.geography.findLocalityById(listing.localityId),
    ]);

    return {
      listing: { ...listing, city, locality },
      owner: owner
        ? {
            id: owner.id,
            name: owner.name,
            publicEmail: owner.email,
            publicPhone: owner.phone,
            trustLevel: owner.trustLevel,
            joinedAt: owner.createdAt,
          }
        : null,
      reportCount,
    };
  }

  /**
   * Correct a listing on the owner's behalf.
   *
   * A reason is required even for a typo fix: this edits content somebody else
   * wrote and is publicly attributed to them, so the audit row is what lets
   * that be explained later.
   */
  @Patch(":id")
  async edit(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(editSchema)) dto: z.infer<typeof editSchema>,
    @CurrentUser() admin: User,
  ) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFound("Listing");

    const { reason, ...patch } = dto;

    const updated = await this.listings.update(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });

    await this.audit(
      admin,
      "editlisting",
      id,
      `${reason} (fields: ${Object.keys(patch).join(", ") || "none"})`,
    );

    return updated;
  }

  /** Soft delete. Reversible in the database, invisible everywhere else. */
  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string, @CurrentUser() admin: User) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFound("Listing");

    await this.listings.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.audit(admin, "deletelisting", id, "Deleted by super admin");
  }

  private async audit(
    admin: User,
    action: string,
    targetId: string,
    note: string,
  ): Promise<void> {
    await this.reports.recordAction({
      id: randomUUID(),
      moderatorId: admin.id,
      targetType: "listing",
      targetId,
      action: action as never,
      note,
      createdAt: new Date().toISOString(),
    });
  }
}
