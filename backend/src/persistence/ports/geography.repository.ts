import type {
  Amenity,
  City,
  Locality,
  State,
} from "src/domain/geography.entity";

export const GEOGRAPHY_REPOSITORY = Symbol("GEOGRAPHY_REPOSITORY");

export interface GeographyRepository {
  listStates(): Promise<State[]>;
  listDistricts(stateCode: string): Promise<City[]>;

  listCities(): Promise<City[]>;
  findCityBySlug(slug: string): Promise<City | null>;
  findCityById(id: string): Promise<City | null>;
  findCitiesByIds(ids: string[]): Promise<Map<string, City>>;
  createCity(city: City): Promise<City>;
  updateCity(id: string, patch: Partial<City>): Promise<City>;
  deleteCity(id: string): Promise<void>;

  listLocalities(cityId: string): Promise<Locality[]>;
  findLocalityBySlug(cityId: string, slug: string): Promise<Locality | null>;
  findLocalityById(id: string): Promise<Locality | null>;
  findLocalitiesByIds(ids: string[]): Promise<Map<string, Locality>>;
  createLocality(locality: Locality): Promise<Locality>;
  updateLocality(id: string, patch: Partial<Locality>): Promise<Locality>;
  deleteLocality(id: string): Promise<void>;
  resolveLocality(cityId: string, query: string): Promise<Locality | null>;

  listAmenities(): Promise<Amenity[]>;
  findAmenityById(id: string): Promise<Amenity | null>;
  createAmenity(amenity: Amenity): Promise<Amenity>;
  updateAmenity(id: string, patch: Partial<Amenity>): Promise<Amenity>;
  deleteAmenity(id: string): Promise<void>;
}
