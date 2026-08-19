import type { Furnishing, PostedBy, RoomType } from "./listing";

export type SortOption = "relevance" | "newest" | "rentlow" | "renthigh";

/**
 * The full filter state. Serialised into the URL so a search is shareable and
 * a saved search is just a stored copy of this object.
 *
 * Sort defaults to "relevance", never to rent. Cheapest-first as a default
 * rewards bait pricing — see docs/00-product-spec.md.
 */
export interface SearchFilters {
  citySlug: string;
  localitySlugs: string[];
  roomTypes: RoomType[];
  furnishing: Furnishing[];
  postedBy: PostedBy[];
  minRentPaise: number | null;
  maxRentPaise: number | null;
  amenitySlugs: string[];
  availableFrom: string | null;
  /**
   * How many people need the room. Not a hard capacity check — it narrows to
   * the room types that plausibly suit that many, which is what a seeker
   * actually means when they pick it.
   */
  occupancy: number | null;
  sort: SortOption;
  page: number;
}
