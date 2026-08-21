import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import {
  SAVED_REPOSITORY,
  type SavedRepository,
} from "src/persistence/ports/saved.repository";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import { presentSummary } from "src/modules/listings/listings.presenter";
import type { User } from "src/domain/user.entity";
import type { City, Locality } from "src/domain/geography.entity";

const createSearchSchema = z.object({
  label: z.string().trim().min(1).max(120),
  query: z.string().trim().min(1).max(500),
  notifyFrequency: z.enum(["off", "daily", "instant"]).default("daily"),
});

@Controller("saved")
export class SavedController {
  constructor(
    @Inject(SAVED_REPOSITORY) private readonly saved: SavedRepository,
    @Inject(GEOGRAPHY_REPOSITORY)
    private readonly geography: GeographyRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    private readonly config: ConfigService,
  ) {}

  @Get("listings/ids")
  async listingIds(@CurrentUser() user: User) {
    return this.saved.listSavedListingIds(user.id);
  }

  @Get("listings")
  async listings(@CurrentUser() user: User) {
    const listings = await this.saved.listSavedListings(user.id);
    const imageHost = this.config.get<string>("PUBLIC_IMAGE_HOST") ?? "";

    const [cityById, localityById] = await Promise.all([
      this.geography.findCitiesByIds(listings.map((l) => l.cityId)),
      this.geography.findLocalitiesByIds(listings.map((l) => l.localityId)),
    ]);

    const listers = await this.users.findManyByIds(
      listings.map((l) => l.ownerId),
    );

    const items = [];
    for (const listing of listings) {
      const city: City = cityById.get(listing.cityId) ?? {
        id: listing.cityId,
        name: "Location",
        slug: "location",
        state: "State",
        isActive: true,
        centroidLat: 0,
        centroidLng: 0,
      };
      const locality: Locality = localityById.get(listing.localityId) ?? {
        id: listing.localityId,
        cityId: listing.cityId,
        name: city.name,
        slug: city.slug,
        aliases: [],
        centroidLat: 0,
        centroidLng: 0,
      };
      const lister = listers.get(listing.ownerId) ?? {
        id: listing.ownerId,
        email: "",
        emailVerifiedAt: null,
        passwordHash: "",
        phone: "",
        phoneVerifiedAt: null,
        name: "Lister",
        avatarUrl: null,
        trustLevel: "new" as const,
        role: "user" as const,
        platformRole: "user" as const,
        verifications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        suspendedAt: null,
        deletedAt: null,
      };

      items.push(
        presentSummary(listing, city, locality, lister, imageHost, true),
      );
    }

    return items;
  }

  @Post("listings/:id")
  @HttpCode(204)
  async save(@Param("id") id: string, @CurrentUser() user: User) {
    await this.saved.saveListing(user.id, id);
  }

  @Delete("listings/:id")
  @HttpCode(204)
  async unsave(@Param("id") id: string, @CurrentUser() user: User) {
    await this.saved.unsaveListing(user.id, id);
  }

  @Get("searches")
  async searches(@CurrentUser() user: User) {
    return this.saved.listSearches(user.id);
  }

  @Post("searches")
  async createSearch(
    @Body(new ZodValidationPipe(createSearchSchema))
    dto: z.infer<typeof createSearchSchema>,
    @CurrentUser() user: User,
  ) {
    return this.saved.createSearch({
      id: randomUUID(),
      userId: user.id,
      label: dto.label,
      query: dto.query,
      notifyFrequency: dto.notifyFrequency,
      createdAt: new Date().toISOString(),
    });
  }

  @Delete("searches/:id")
  @HttpCode(204)
  async deleteSearch(@Param("id") id: string, @CurrentUser() user: User) {
    await this.saved.deleteSearch(user.id, id);
  }
}
