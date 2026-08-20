import { serverApi as api, serverTryGet as tryGet } from "./serverclient";
import type { SavedSearch } from "@/types/savedsearch";

export function getSavedListingIds(): Promise<string[]> {
  return tryGet<string[]>("/saved/listings", []);
}

export function saveListing(listingId: string) {
  return api.post(`/saved/listings/${listingId}`);
}

export function unsaveListing(listingId: string) {
  return api.delete(`/saved/listings/${listingId}`);
}

export function getSavedSearches(): Promise<SavedSearch[]> {
  return tryGet<SavedSearch[]>("/saved/searches", []);
}

export function createSavedSearch(input: {
  label: string;
  query: string;
  notifyFrequency: "off" | "daily" | "instant";
}) {
  return api.post("/saved/searches", input);
}

export function deleteSavedSearch(id: string) {
  return api.delete(`/saved/searches/${id}`);
}
