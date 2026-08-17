import type { SearchFilters, SortOption } from "@/types/searchfilters";
import type { Furnishing, PostedBy, RoomType } from "@/types/listing";

type RawParams = Record<string, string | string[] | undefined>;

const sortOptions: SortOption[] = ["relevance", "newest", "rentlow", "renthigh"];

/**
 * Search state lives in the URL, not in a store. That makes every result page
 * shareable and back-button-correct, and it means a saved search is just a
 * stored copy of these filters.
 */
export function parseSearchParams(
  params: RawParams,
  citySlug: string,
): SearchFilters {
  return {
    citySlug,
    localitySlugs: toArray(params.locality),
    roomTypes: toArray(params.type) as RoomType[],
    furnishing: toArray(params.furnishing) as Furnishing[],
    postedBy: toArray(params.by) as PostedBy[],
    minRentPaise: toPaise(params.minrent),
    maxRentPaise: toPaise(params.maxrent),
    amenitySlugs: toArray(params.amenity),
    availableFrom: toSingle(params.from),
    occupancy: toOccupancy(params.people),
    sort: toSort(params.sort),
    page: toPage(params.page),
  };
}

/** Inverse of the parser. Empty values are dropped so URLs stay short. */
export function buildSearchQuery(filters: Partial<SearchFilters>): string {
  const query = new URLSearchParams();

  filters.localitySlugs?.forEach((v) => query.append("locality", v));
  filters.roomTypes?.forEach((v) => query.append("type", v));
  filters.furnishing?.forEach((v) => query.append("furnishing", v));
  filters.postedBy?.forEach((v) => query.append("by", v));
  filters.amenitySlugs?.forEach((v) => query.append("amenity", v));

  // Rupees in the URL, paise internally — a shareable link should read
  // "minrent=8000", not "minrent=800000".
  if (filters.minRentPaise != null) {
    query.set("minrent", String(filters.minRentPaise / 100));
  }
  if (filters.maxRentPaise != null) {
    query.set("maxrent", String(filters.maxRentPaise / 100));
  }
  if (filters.availableFrom) query.set("from", filters.availableFrom);
  if (filters.occupancy != null) query.set("people", String(filters.occupancy));
  if (filters.sort && filters.sort !== "relevance") {
    query.set("sort", filters.sort);
  }
  if (filters.page && filters.page > 1) {
    query.set("page", String(filters.page));
  }

  const result = query.toString();
  return result ? `?${result}` : "";
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toSingle(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toPaise(value: string | string[] | undefined): number | null {
  const raw = toSingle(value);
  if (!raw) return null;

  const rupees = Number(raw);
  return Number.isFinite(rupees) && rupees >= 0 ? rupees * 100 : null;
}

function toSort(value: string | string[] | undefined): SortOption {
  const raw = toSingle(value);
  return sortOptions.includes(raw as SortOption)
    ? (raw as SortOption)
    : "relevance";
}

function toOccupancy(value: string | string[] | undefined): number | null {
  const raw = Number(toSingle(value));
  // Clamped rather than trusted: this comes straight from the URL.
  return Number.isInteger(raw) && raw >= 1 && raw <= 10 ? raw : null;
}

function toPage(value: string | string[] | undefined): number {
  const raw = Number(toSingle(value));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}
