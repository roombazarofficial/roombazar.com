import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { NotFound, ValidationFailed } from "src/common/errors/domain.errors";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";
import { policyFor } from "src/common/trustlevels";
import type { User } from "src/domain/user.entity";

const listQuerySchema = z.object({
  query: z.string().trim().max(120).optional(),
  role: z.enum(["user", "moderator", "admin", "superadmin"]).optional(),
  trustLevel: z.enum(["new", "verified", "trusted", "restricted"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

const roleSchema = z.object({
  role: z.enum(["user", "moderator", "admin", "superadmin"]),
  reason: z.string().trim().min(5).max(500),
});

const trustSchema = z.object({
  trustLevel: z.enum(["new", "verified", "trusted", "restricted"]),
  reason: z.string().trim().min(5).max(500),
});

/**
 * User administration.
 *
 * Every mutation here writes an audit row. Changing someone's role or trust
 * level alters what they can do to other people's data, so "who did this and
 * why" has to survive the change itself.
 */
@Controller("superadmin/users")
@SuperAdminOnly()
export class AdminUsersController {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
  ) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(listQuerySchema))
    query: z.infer<typeof listQuerySchema>,
  ) {
    return this.users.findForAdmin({
      query: query.query,
      role: query.role,
      trustLevel: query.trustLevel,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  /** One user with the context needed to judge them. */
  @Get(":id")
  async detail(@Param("id") id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFound("User");

    const [listings, reportCount] = await Promise.all([
      this.listings.findByOwner(id),
      this.reports.countForTarget("user", id),
    ]);

    return {
      user,
      // The admin console is the one place these are legitimately visible.
      publicEmail: user.email,
      publicPhone: user.phone,
      limits: policyFor(user.trustLevel),
      listingCounts: countBy(listings, (l) => l.status),
      reportCount,
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateUserSchema))
    dto: z.infer<typeof updateUserSchema>,
    @CurrentUser() admin: User,
  ) {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFound("User");

    const updated = await this.users.update(id, dto);

    await this.audit(admin, "updateuser", id, `Edited profile fields`);

    return updated;
  }

  /**
   * Change a role.
   *
   * Two things are refused outright: demoting yourself, and removing the last
   * super admin. Either one can lock every human out of the console, and the
   * only way back is a database edit.
   */
  @Post(":id/role")
  @HttpCode(200)
  async setRole(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(roleSchema)) dto: z.infer<typeof roleSchema>,
    @CurrentUser() admin: User,
  ) {
    const target = await this.users.findById(id);
    if (!target) throw new NotFound("User");

    if (target.id === admin.id && dto.role !== "superadmin") {
      throw new ValidationFailed(
        "You cannot remove your own super admin access",
      );
    }

    if (target.role === "superadmin" && dto.role !== "superadmin") {
      const remaining = await this.users.countByRole("superadmin");

      if (remaining <= 1) {
        throw new ValidationFailed(
          "This is the last super admin. Promote someone else first.",
        );
      }
    }

    const updated = await this.users.update(id, { role: dto.role });

    await this.audit(
      admin,
      "changerole",
      id,
      `${target.role} to ${dto.role}: ${dto.reason}`,
    );

    return updated;
  }

  /** Override trust level, bypassing the automatic promotion rules. */
  @Post(":id/trustlevel")
  @HttpCode(200)
  async setTrustLevel(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(trustSchema)) dto: z.infer<typeof trustSchema>,
    @CurrentUser() admin: User,
  ) {
    const target = await this.users.findById(id);
    if (!target) throw new NotFound("User");

    const updated = await this.users.setTrustLevel(id, dto.trustLevel);

    await this.audit(
      admin,
      dto.trustLevel === "restricted" ? "restrictuser" : "unrestrictuser",
      id,
      `${target.trustLevel} to ${dto.trustLevel}: ${dto.reason}`,
    );

    return updated;
  }

  /**
   * Soft delete. The row is tombstoned rather than dropped so that messages
   * which are evidence in an open report keep a sender.
   */
  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string, @CurrentUser() admin: User) {
    const target = await this.users.findById(id);
    if (!target) throw new NotFound("User");

    if (target.id === admin.id) {
      throw new ValidationFailed("You cannot delete your own account here");
    }

    if (target.role === "superadmin") {
      throw new ValidationFailed(
        "Demote this super admin before deleting the account",
      );
    }

    await this.users.softDelete(id);
    await this.audit(admin, "deleteuser", id, "Account deleted by super admin");
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
      targetType: "user",
      targetId,
      action: action as never,
      note,
      createdAt: new Date().toISOString(),
    });
  }
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const item of items) {
    const k = key(item);
    counts[k] = (counts[k] ?? 0) + 1;
  }

  return counts;
}
