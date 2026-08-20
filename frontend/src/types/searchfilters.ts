import type { Furnishing, PostedBy, RoomType } from "./listing";

export type SortOption = "relevance" | "newest" | "rentlow" | "renthigh";

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
  occupancy: number | null;
  sort: SortOption;
  page: number;
}
