import { api } from "./client";

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
