import { Controller, Get, Param, Query } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";
import { NotFound } from "src/common/errors/domain.errors";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";

@Controller()
export class GeographyController {
  constructor(
    @Inject(GEOGRAPHY_REPOSITORY)
    private readonly geography: GeographyRepository,
  ) {}

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

  @Public()
  @Get("amenities")
  async amenities() {
    return this.geography.listAmenities();
  }
}
