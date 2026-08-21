import { serverTryGet as tryGet } from "./serverclient";
import type { SavedSearch } from "@/types/savedsearch";
import type { ListingSummary } from "@/types/listing";

export function getSavedListingIds(): Promise<string[]> {
  return tryGet<string[]>("/saved/listings/ids", []);
}

export function getSavedListings(): Promise<ListingSummary[]> {
  return tryGet<ListingSummary[]>("/saved/listings", []);
}

export function getSavedSearches(): Promise<SavedSearch[]> {
  return tryGet<SavedSearch[]>("/saved/searches", []);
}
