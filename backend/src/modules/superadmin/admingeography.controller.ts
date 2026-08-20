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
} from "@nestjs/common";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { NotFound, ValidationFailed } from "src/common/errors/domain.errors";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";
import type { User } from "src/domain/user.entity";

const citySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  state: z.string().trim().min(2).max(80),
  isActive: z.boolean().default(true),
  centroidLat: z.number().min(-90).max(90),
  centroidLng: z.number().min(-180).max(180),
});

const localitySchema = z.object({
  cityId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  /**
   * Alternate spellings. Without these, "Indiranagar" and "Indira Nagar"
   * fragment search and both sides of the market stop finding each other, so
   * this is the field most worth filling in properly.
   */
  aliases: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  centroidLat: z.number().min(-90).max(90),
  centroidLng: z.number().min(-180).max(180),
});

const amenitySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+$/, "Lowercase letters and numbers only"),
  label: z.string().trim().min(2).max(80),
  category: z.enum(["utilities", "safety", "convenience", "rules"]),
});

/**
 * Reference data: cities, localities, amenities.
 *
 * Super admin only. These tables are read by search filters, the post wizard
 * typeahead and every locality landing page — renaming a locality renames a
 * place for everybody, and deleting one can orphan listings. That is a
 * different weight of action from moderating a single room.
 */
@Controller("superadmin/geography")
@SuperAdminOnly()
export class AdminGeographyController {
  constructor(
    @Inject(GEOGRAPHY_REPOSITORY)
    private readonly geography: GeographyRepository,
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
  ) {}

  // ---------------------------------------------------------------- cities

  @Get("cities")
  async listCities() {
    return this.geography.listCities();
  }

  @Post("cities")
  async createCity(
    @Body(new ZodValidationPipe(citySchema)) dto: z.infer<typeof citySchema>,
    @CurrentUser() admin: User,
  ) {
    const clash = await this.geography.findCityBySlug(dto.slug);
    if (clash) throw new ValidationFailed("A city already uses that slug", {
      slug: "Already taken",
    });

    const city = await this.geography.createCity({ id: randomUUID(), ...dto });

    await this.audit(admin, "createcity", city.id, `Added city ${city.name}`);

    return city;
  }

  @Patch("cities/:id")
  async updateCity(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(citySchema.partial()))
    dto: Partial<z.infer<typeof citySchema>>,
    @CurrentUser() admin: User,
  ) {
    const existing = await this.geography.findCityById(id);
    if (!existing) throw new NotFound("City");

    const city = await this.geography.updateCity(id, dto);

    await this.audit(admin, "updatecity", id, `Edited city ${city.name}`);

    return city;
  }

  /**
   * Deleting a city with localities or listings under it will fail on the
   * foreign key, which is the correct outcome — orphaned listings would be
   * unreachable rather than visibly broken. Deactivate instead of deleting.
   */
  @Delete("cities/:id")
  @HttpCode(204)
  async deleteCity(@Param("id") id: string, @CurrentUser() admin: User) {
    const existing = await this.geography.findCityById(id);
    if (!existing) throw new NotFound("City");

    await this.geography.deleteCity(id);
    await this.audit(admin, "deletecity", id, `Deleted city ${existing.name}`);
  }

  // ------------------------------------------------------------ localities

  @Get("cities/:cityId/localities")
  async listLocalities(@Param("cityId") cityId: string) {
    return this.geography.listLocalities(cityId);
  }

  @Post("localities")
  async createLocality(
    @Body(new ZodValidationPipe(localitySchema))
    dto: z.infer<typeof localitySchema>,
    @CurrentUser() admin: User,
  ) {
    const city = await this.geography.findCityById(dto.cityId);
    if (!city) throw new ValidationFailed("Unknown city", { cityId: "Not found" });

    const clash = await this.geography.findLocalityBySlug(dto.cityId, dto.slug);
    if (clash) {
      throw new ValidationFailed("A locality in this city uses that slug", {
        slug: "Already taken",
      });
    }

    const locality = await this.geography.createLocality({
      id: randomUUID(),
      ...dto,
    });

    await this.audit(
      admin,
      "createlocality",
      locality.id,
      `Added ${locality.name} to ${city.name}`,
    );

    return locality;
  }

  @Patch("localities/:id")
  async updateLocality(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(localitySchema.partial()))
    dto: Partial<z.infer<typeof localitySchema>>,
    @CurrentUser() admin: User,
  ) {
    const existing = await this.geography.findLocalityById(id);
    if (!existing) throw new NotFound("Locality");

    const locality = await this.geography.updateLocality(id, dto);

    await this.audit(
      admin,
      "updatelocality",
      id,
      `Edited ${locality.name}`,
    );

    return locality;
  }

  @Delete("localities/:id")
  @HttpCode(204)
  async deleteLocality(@Param("id") id: string, @CurrentUser() admin: User) {
    const existing = await this.geography.findLocalityById(id);
    if (!existing) throw new NotFound("Locality");

    await this.geography.deleteLocality(id);

    await this.audit(
      admin,
      "deletelocality",
      id,
      `Deleted locality ${existing.name}`,
    );
  }

  // -------------------------------------------------------------- amenities

  @Get("amenities")
  async listAmenities() {
    return this.geography.listAmenities();
  }

  @Post("amenities")
  async createAmenity(
    @Body(new ZodValidationPipe(amenitySchema))
    dto: z.infer<typeof amenitySchema>,
    @CurrentUser() admin: User,
  ) {
    const amenity = await this.geography.createAmenity({
      id: randomUUID(),
      ...dto,
    });

    await this.audit(
      admin,
      "createamenity",
      amenity.id,
      `Added amenity ${amenity.label}`,
    );

    return amenity;
  }

  @Patch("amenities/:id")
  async updateAmenity(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(amenitySchema.partial()))
    dto: Partial<z.infer<typeof amenitySchema>>,
    @CurrentUser() admin: User,
  ) {
    const existing = await this.geography.findAmenityById(id);
    if (!existing) throw new NotFound("Amenity");

    const amenity = await this.geography.updateAmenity(id, dto);

    await this.audit(admin, "updateamenity", id, `Edited ${amenity.label}`);

    return amenity;
  }

  @Delete("amenities/:id")
  @HttpCode(204)
  async deleteAmenity(@Param("id") id: string, @CurrentUser() admin: User) {
    const existing = await this.geography.findAmenityById(id);
    if (!existing) throw new NotFound("Amenity");

    await this.geography.deleteAmenity(id);

    await this.audit(
      admin,
      "deleteamenity",
      id,
      `Deleted amenity ${existing.label}`,
    );
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
      // Reference data is not a listing, user or message; the audit log records
      // it under listing so the trail stays in one place rather than adding a
      // target type nothing else uses.
      targetType: "listing",
      targetId,
      action: action as never,
      note,
      createdAt: new Date().toISOString(),
    });
  }
}
