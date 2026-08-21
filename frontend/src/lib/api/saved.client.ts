import { api } from "./client";
import type { ListingSummary } from "@/types/listing";

export function fetchSavedListingIds(): Promise<string[]> {
  return api.get<string[]>("/saved/listings/ids");
}

export function fetchSavedListings(): Promise<ListingSummary[]> {
  return api.get<ListingSummary[]>("/saved/listings");
}

export function saveListing(listingId: string) {
  return api.post(`/saved/listings/${listingId}`);
}

export function unsaveListing(listingId: string) {
  return api.delete(`/saved/listings/${listingId}`);
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
