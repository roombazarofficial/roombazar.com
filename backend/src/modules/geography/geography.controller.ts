import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { NotFound } from "src/common/errors/domain.errors";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import { PrismaService } from "src/persistence/prisma/prisma.service";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";

@Controller()
export class GeographyController {
  constructor(
    @Inject(GEOGRAPHY_REPOSITORY)
    private readonly geography: GeographyRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get("states")
  async states() {
    return this.geography.listStates();
  }

  @Public()
  @Get("states/:code/districts")
  async districts(@Param("code") code: string) {
    return this.geography.listDistricts(code);
  }

  @Public()
  @Get("districts/:slug/cities")
  async districtCities(@Param("slug") slug: string) {
    const district = await this.geography.findCityBySlug(slug);
    if (!district) throw new NotFound("District");

    return this.geography.listLocalities(district.id);
  }

  @Public()
  @Get("cities")
  async cities() {
    return this.geography.listCities();
  }

  @Public()
  @Get("cities/:slug/localities")
  async localities(@Param("slug") slug: string) {
    const city = await this.geography.findCityBySlug(slug);
    if (!city) throw new NotFound("City");

    return this.geography.listLocalities(city.id);
  }

  @Public()
  @Get("cities/:slug/localities/resolve")
  async resolve(@Param("slug") slug: string, @Query("q") q: string) {
    const city = await this.geography.findCityBySlug(slug);
    if (!city) throw new NotFound("City");

    return this.geography.resolveLocality(city.id, q ?? "");
  }

  @Post("cities/:slug/localities/requests")
  async requestLocality(
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(z.object({ name: z.string().trim().min(2).max(100) })))
    dto: { name: string },
    @CurrentUser() user: User,
  ) {
    const city = await this.geography.findCityBySlug(slug);
    if (!city) throw new NotFound("City");

    const existing = await this.prisma.localityRequest.findFirst({
      where: {
        cityId: city.id,
        requestedBy: user.id,
        name: { equals: dto.name, mode: "insensitive" },
        resolved: false,
      },
    });

    return existing ?? this.prisma.localityRequest.create({
      data: { cityId: city.id, requestedBy: user.id, name: dto.name },
    });
  }

  @Public()
  @Get("amenities")
  async amenities() {
    return this.geography.listAmenities();
  }
}
