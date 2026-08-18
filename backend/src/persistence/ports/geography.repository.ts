import type { Amenity, City, Locality } from "src/domain/geography.entity";

export const GEOGRAPHY_REPOSITORY = Symbol("GEOGRAPHY_REPOSITORY");

export interface GeographyRepository {
  listCities(): Promise<City[]>;
  findCityBySlug(slug: string): Promise<City | null>;

  listLocalities(cityId: string): Promise<Locality[]>;
  findLocalityBySlug(cityId: string, slug: string): Promise<Locality | null>;
  resolveLocality(cityId: string, query: string): Promise<Locality | null>;

  listAmenities(): Promise<Amenity[]>;
}
