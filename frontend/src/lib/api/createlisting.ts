import { api } from "./client";
import type { CreateListingPayload } from "@/store/listingdraftstore";
import type { Listing } from "@/types/listing";

/*
  Deliberately not in listings.ts. That module imports serverclient, which is
  server-only, and the publish button lives in a client component — importing
  it there would pull server-only code into the browser bundle.
*/
export function createListing(
  payload: CreateListingPayload,
): Promise<Listing> {
  return api.post<Listing>("/listings", payload);
}
