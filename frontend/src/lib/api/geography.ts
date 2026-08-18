import { api, tryGet } from "./client";
import type { City } from "@/types/city";
import type { Locality } from "@/types/locality";
import type { Amenity } from "@/types/amenity";

const REFERENCE_TTL = 3600;

export function getCities(): Promise<City[]> {
  return tryGet<City[]>("/cities", [], { revalidate: REFERENCE_TTL });
}

/*
  The fetch* pair below deliberately throws instead of falling back to an empty
  array. A page that renders a list can degrade to showing nothing, but a form
  control cannot: an empty dropdown looks identical to a broken one, and the
  lister is left tapping a control that will never open.
*/
export function fetchCities(): Promise<City[]> {
  return api.get<City[]>("/cities", { revalidate: REFERENCE_TTL });
}

export function fetchLocalities(citySlug: string): Promise<Locality[]> {
  return api.get<Locality[]>(`/cities/${citySlug}/localities`, {
    revalidate: REFERENCE_TTL,
  });
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const cities = await getCities();
  return cities.find((city) => city.slug === slug) ?? null;
}

export function getLocalities(citySlug: string): Promise<Locality[]> {
  return tryGet<Locality[]>(`/cities/${citySlug}/localities`, [], {
    revalidate: REFERENCE_TTL,
  });
}

export async function getLocalityBySlug(
  citySlug: string,
  localitySlug: string,
): Promise<Locality | null> {
  const localities = await getLocalities(citySlug);
  return localities.find((locality) => locality.slug === localitySlug) ?? null;
}

export function resolveLocality(
  citySlug: string,
  query: string,
): Promise<Locality | null> {
  return tryGet<Locality | null>(
    `/cities/${citySlug}/localities/resolve?q=${encodeURIComponent(query)}`,
    null,
  );
}

export function getAmenities(): Promise<Amenity[]> {
  return tryGet<Amenity[]>("/amenities", [], { revalidate: REFERENCE_TTL });
}

export function requestLocalityAdd(citySlug: string, name: string) {
  return api.post(`/cities/${citySlug}/localities/requests`, { name });
}
