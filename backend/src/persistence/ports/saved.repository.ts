import type { Listing } from "src/domain/listing.entity";

export const SAVED_REPOSITORY = Symbol("SAVED_REPOSITORY");

export interface SavedSearch {
  id: string;
  userId: string;
  label: string;
  query: string;
  notifyFrequency: "off" | "daily" | "instant";
  createdAt: string;
}

export interface SavedRepository {
  listSavedListingIds(userId: string): Promise<string[]>;
  listSavedListings(userId: string): Promise<Listing[]>;
  saveListing(userId: string, listingId: string): Promise<void>;
  unsaveListing(userId: string, listingId: string): Promise<void>;

  listSearches(userId: string): Promise<SavedSearch[]>;
  createSearch(search: SavedSearch): Promise<SavedSearch>;
  deleteSearch(userId: string, searchId: string): Promise<void>;
}
