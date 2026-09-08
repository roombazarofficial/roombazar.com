import { api, tryGet } from "./client";
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

export interface SitemapEntry {
  slug: string;
  updatedAt: string;
  publishedAt: string | null;
  citySlug: string;
  cityName: string;
  localitySlug: string;
  localityName: string;
}

/**
 * Full projection of every publicly indexable listing, for `app/sitemap.ts`.
 * Backed by the dedicated bulk endpoint `${NEXT_PUBLIC_API_URL}/api/sitemap/listings`
 * on the backend host — never a relative path on the frontend origin.
 *
 * Unlike most reads here this deliberately does NOT swallow errors: if the
 * backend is unreachable or the endpoint is missing, we must fail the sitemap
 * render (→ 5xx, which Google retries) rather than silently publish a sitemap
 * that omits every listing and looks like the whole site is 8 static pages.
 *
 * A backend `200 { items: [] }` (a genuinely empty marketplace) is respected.
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const response = await api.get<{ items: SitemapEntry[] }>("/sitemap/listings", {
    revalidate: 900,
  });

  if (!response || !Array.isArray(response.items)) {
    throw new Error(
      "sitemap/listings returned an unexpected shape (deployed backend missing the endpoint?)",
    );
  }

  return response.items;
}

export function getMyListings(): Promise<Listing[]> {
  return serverTryGet<Listing[]>("/listings/mine", []);
}

export function getMyListing(id: string): Promise<Listing | null> {
  return serverTryGet<Listing | null>(`/listings/${id}`, null);
}
