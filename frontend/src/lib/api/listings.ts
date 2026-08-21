import { tryGet } from "./client";
import { serverTryGet } from "./serverclient";
import type { Listing, ListingSummary } from "@/types/listing";
import type { SearchFilters } from "@/types/searchfilters";
import type { Paginated } from "@/types/api";

const EMPTY_PAGE: Paginated<ListingSummary> = {
  items: [],
  page: 1,
  pageSize: 24,
  totalItems: 0,
  totalPages: 1,
};

const SEARCH_TTL = 0;

export function searchListings(
  filters: Partial<SearchFilters> & { citySlug?: string },
): Promise<Paginated<ListingSummary>> {
  const query = new URLSearchParams();
  if (filters.citySlug) query.set("city", filters.citySlug);

  filters.localitySlugs?.forEach((value) => query.append("locality", value));
  filters.roomTypes?.forEach((value) => query.append("type", value));
  filters.furnishing?.forEach((value) => query.append("furnishing", value));
  filters.postedBy?.forEach((value) => query.append("by", value));
  filters.amenitySlugs?.forEach((value) => query.append("amenity", value));

  if (filters.minRentPaise != null) {
    query.set("minrent", String(filters.minRentPaise / 100));
  }
  if (filters.maxRentPaise != null) {
    query.set("maxrent", String(filters.maxRentPaise / 100));
  }
  if (filters.availableFrom) query.set("from", filters.availableFrom);
  if (filters.occupancy != null) query.set("people", String(filters.occupancy));
  if (filters.sort) query.set("sort", filters.sort);
  if (filters.page) query.set("page", String(filters.page));

  return tryGet<Paginated<ListingSummary>>(
    `/search?${query.toString()}`,
    EMPTY_PAGE,
    { revalidate: SEARCH_TTL },
  );
}

export function getListingBySlug(slug: string): Promise<Listing | null> {
  return tryGet<Listing | null>(`/listings/slug/${slug}`, null, {
    revalidate: SEARCH_TTL,
  });
}

export async function getSimilarListings(
  listing: Listing,
  limit = 4,
): Promise<ListingSummary[]> {
  const page = await searchListings({
    citySlug: listing.city.slug,
    localitySlugs: [listing.locality.slug],
    page: 1,
  });

  return page.items.filter((item) => item.id !== listing.id).slice(0, limit);
}

export async function getRecentListings(
  limit = 8,
  citySlug?: string,
): Promise<ListingSummary[]> {
  const page = await searchListings({
    citySlug,
    sort: "newest",
    page: 1,
  });
  return page.items.slice(0, limit);
}

export function getMyListings(): Promise<Listing[]> {
  return serverTryGet<Listing[]>("/listings/mine", []);
}

export function getMyListing(id: string): Promise<Listing | null> {
  return serverTryGet<Listing | null>(`/listings/${id}`, null);
}
