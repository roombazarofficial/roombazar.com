import { Injectable } from "@nestjs/common";
import type { Amenity, City, Locality } from "src/domain/geography.entity";
import type { GeographyRepository } from "src/persistence/ports/geography.repository";

export const seedCities: City[] = [
  {
    id: "city-blr",
    name: "Bengaluru",
    slug: "bengaluru",
    state: "Karnataka",
    isActive: true,
    centroidLat: 12.9716,
    centroidLng: 77.5946,
  },
];

export const seedLocalities: Locality[] = [
  {
    id: "loc-koramangala",
    cityId: "city-blr",
    name: "Koramangala",
    slug: "koramangala",
    aliases: ["Koramangla", "Koramangala 5th Block", "Kormangala"],
    centroidLat: 12.9352,
    centroidLng: 77.6245,
  },
  {
    id: "loc-indiranagar",
    cityId: "city-blr",
    name: "Indiranagar",
    slug: "indiranagar",
    aliases: ["Indira Nagar", "Indranagar", "Indira Nagara"],
    centroidLat: 12.9784,
    centroidLng: 77.6408,
  },
  {
    id: "loc-hsr",
    cityId: "city-blr",
    name: "HSR Layout",
    slug: "hsr-layout",
    aliases: ["HSR", "H S R Layout", "HSR Sector 2"],
    centroidLat: 12.9121,
    centroidLng: 77.6446,
  },
  {
    id: "loc-btm",
    cityId: "city-blr",
    name: "BTM Layout",
    slug: "btm-layout",
    aliases: ["BTM", "B T M Layout", "BTM 2nd Stage"],
    centroidLat: 12.9166,
    centroidLng: 77.6101,
  },
  {
    id: "loc-whitefield",
    cityId: "city-blr",
    name: "Whitefield",
    slug: "whitefield",
    aliases: ["White Field", "Whitefiled"],
    centroidLat: 12.9698,
    centroidLng: 77.75,
  },
];

export const seedAmenities: Amenity[] = [
  { id: "am-1", slug: "attachedbathroom", label: "Attached bathroom", category: "convenience" },
  { id: "am-2", slug: "geyser", label: "Geyser", category: "utilities" },
  { id: "am-3", slug: "powerbackup", label: "Power backup", category: "utilities" },
  { id: "am-4", slug: "water247", label: "24x7 water", category: "utilities" },
  { id: "am-5", slug: "wifi", label: "Wi-Fi", category: "convenience" },
  { id: "am-6", slug: "parkingtwowheeler", label: "Two-wheeler parking", category: "convenience" },
  { id: "am-7", slug: "lift", label: "Lift", category: "convenience" },
  { id: "am-8", slug: "securityguard", label: "Security guard", category: "safety" },
  { id: "am-9", slug: "cctv", label: "CCTV", category: "safety" },
  { id: "am-10", slug: "kitchenaccess", label: "Kitchen access", category: "convenience" },
  { id: "am-11", slug: "washingmachine", label: "Washing machine", category: "convenience" },
  { id: "am-12", slug: "fridge", label: "Fridge", category: "convenience" },
  { id: "am-13", slug: "ac", label: "Air conditioning", category: "convenience" },
  { id: "am-14", slug: "nonvegallowed", label: "Non-veg allowed", category: "rules" },
  { id: "am-15", slug: "petsallowed", label: "Pets allowed", category: "rules" },
  { id: "am-16", slug: "novisitorcurfew", label: "No gate-closing time", category: "rules" },
];

@Injectable()
export class MemoryGeographyRepository implements GeographyRepository {
  async listCities(): Promise<City[]> {
    return seedCities.filter((city) => city.isActive);
  }

  async findCityBySlug(slug: string): Promise<City | null> {
    return seedCities.find((city) => city.slug === slug) ?? null;
  }

  async listLocalities(cityId: string): Promise<Locality[]> {
    return seedLocalities
      .filter((locality) => locality.cityId === cityId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findLocalityBySlug(
    cityId: string,
    slug: string,
  ): Promise<Locality | null> {
    return (
      seedLocalities.find(
        (locality) => locality.cityId === cityId && locality.slug === slug,
      ) ?? null
    );
  }

  async resolveLocality(cityId: string, query: string): Promise<Locality | null> {
    const needle = normalise(query);

    for (const locality of seedLocalities) {
      if (locality.cityId !== cityId) continue;

      const candidates = [locality.name, locality.slug, ...locality.aliases];

      if (candidates.some((candidate) => normalise(candidate) === needle)) {
        return locality;
      }
    }

    return null;
  }

  async listAmenities(): Promise<Amenity[]> {
    return seedAmenities;
  }
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
