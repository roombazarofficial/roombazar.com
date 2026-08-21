import { api } from "./client";

export function markListingTaken(id: string) {
  return api.post(`/listings/${id}/taken`);
}

export function pauseListing(id: string) {
  return api.post(`/listings/${id}/paused`);
}

export function renewListing(
  id: string,
  confirmation: { rentPaise: number; availableFrom: string },
) {
  return api.post(`/listings/${id}/renew`, confirmation);
}

export function deleteListing(id: string) {
  return api.delete(`/listings/${id}`);
}
