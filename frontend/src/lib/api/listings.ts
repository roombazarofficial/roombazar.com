import type { Listing, ListingSummary } from "@/types/listing";
import type { SearchFilters } from "@/types/searchfilters";
import type { Paginated } from "@/types/api";
import { mockListings, toSummary } from "./mockdata";

/**
 * The listings contract. During the frontend-first phase these read from
 * mock data; when the backend lands, only the bodies change and every caller
 * stays as it is.
 */

const PAGE_SIZE = 24;

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  return mockListings.find((listing) => listing.slug === slug) ?? null;
}

export async function searchListings(
  filters: Partial<SearchFilters>,
): Promise<Paginated<ListingSummary>> {
  let results = mockListings.filter((listing) => listing.status === "active");

  if (filters.citySlug) {
    results = results.filter((l) => l.city.slug === filters.citySlug);
  }

  if (filters.localitySlugs?.length) {
    const wanted = new Set(filters.localitySlugs);
    results = results.filter((l) => wanted.has(l.locality.slug));
  }

  if (filters.roomTypes?.length) {
    const wanted = new Set(filters.roomTypes);
    results = results.filter((l) => wanted.has(l.roomType));
  }

  if (filters.furnishing?.length) {
    const wanted = new Set(filters.furnishing);
    results = results.filter((l) => wanted.has(l.furnishing));
  }

  if (filters.postedBy?.length) {
    const wanted = new Set(filters.postedBy);
    results = results.filter((l) => wanted.has(l.postedBy));
  }

  if (filters.minRentPaise != null) {
    results = results.filter((l) => l.rentPaise >= filters.minRentPaise!);
  }

  if (filters.maxRentPaise != null) {
    results = results.filter((l) => l.rentPaise <= filters.maxRentPaise!);
  }

  if (filters.amenitySlugs?.length) {
    const wanted = filters.amenitySlugs;
    results = results.filter((l) =>
      wanted.every((slug) => l.amenities.some((a) => a.slug === slug)),
    );
  }

  if (filters.occupancy != null) {
    const wanted = filters.occupancy;
    results = results.filter((l) => suitsOccupancy(l.roomType, wanted));
  }

  results = sortListings(results, filters.sort ?? "relevance");

  const page = filters.page ?? 1;
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: results.slice(start, start + PAGE_SIZE).map(toSummary),
    page,
    pageSize: PAGE_SIZE,
    totalItems: results.length,
    totalPages: Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
  };
}

/** Same locality first, then nearby, excluding the listing being viewed. */
export async function getSimilarListings(
  listing: Listing,
  limit = 4,
): Promise<ListingSummary[]> {
  const others = mockListings.filter(
    (candidate) =>
      candidate.id !== listing.id && candidate.status === "active",
  );

  const sameLocality = others.filter(
    (candidate) => candidate.locality.id === listing.locality.id,
  );
  const elsewhere = others.filter(
    (candidate) => candidate.locality.id !== listing.locality.id,
  );

  return [...sameLocality, ...elsewhere].slice(0, limit).map(toSummary);
}

export async function getRecentListings(limit = 8): Promise<ListingSummary[]> {
  return sortListings(
    mockListings.filter((l) => l.status === "active"),
    "newest",
  )
    .slice(0, limit)
    .map(toSummary);
}

/**
 * Which room types plausibly suit a given number of people. A PG or hostel bed
 * is sold per person, so it only ever suits one; a 2BHK is wasted on a single
 * seeker but is not excluded, since plenty of people do rent one alone.
 */
function suitsOccupancy(roomType: Listing["roomType"], people: number): boolean {
  const capacity: Record<Listing["roomType"], number> = {
    pgbed: 1,
    hostelbed: 1,
    sharedroom: 1,
    singleroom: 2,
    rk1: 2,
    bhk1: 3,
    bhk2: 4,
    bhk3plus: 6,
  };

  return capacity[roomType] >= people;
}

/**
 * "relevance" blends recency with listing completeness — never rent.
 * Cheapest-first as a default rewards bait pricing, so it is only ever an
 * explicit choice by the seeker. See docs/00-product-spec.md.
 */
function sortListings(items: Listing[], sort: SearchFilters["sort"]): Listing[] {
  const sorted = [...items];

  switch (sort) {
    case "rentlow":
      return sorted.sort((a, b) => a.rentPaise - b.rentPaise);
    case "renthigh":
      return sorted.sort((a, b) => b.rentPaise - a.rentPaise);
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? 0).getTime(),
      );
    case "relevance":
    default:
      return sorted.sort((a, b) => rankScore(b) - rankScore(a));
  }
}

function rankScore(listing: Listing): number {
  const publishedAt = new Date(listing.publishedAt ?? listing.createdAt);
  const ageDays =
    (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

  const recency = Math.max(0, 30 - ageDays) / 30;
  const completeness =
    (listing.photos.length >= 3 ? 0.3 : 0.1) +
    (listing.description.length > 120 ? 0.2 : 0) +
    (listing.areaSqft ? 0.1 : 0) +
    (listing.amenities.length >= 6 ? 0.2 : 0.1);
  const trust = listing.lister.trustLevel === "trusted" ? 0.3 : 0.1;

  return recency + completeness + trust;
}
