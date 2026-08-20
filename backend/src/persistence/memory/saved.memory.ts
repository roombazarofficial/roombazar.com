import { Injectable } from "@nestjs/common";
import type {
  SavedRepository,
  SavedSearch,
} from "src/persistence/ports/saved.repository";

@Injectable()
export class MemorySavedRepository implements SavedRepository {
  private readonly listings = new Map<string, Set<string>>();
  private readonly searches = new Map<string, SavedSearch[]>();

  async listSavedListingIds(userId: string): Promise<string[]> {
    return [...(this.listings.get(userId) ?? [])];
  }

  async saveListing(userId: string, listingId: string): Promise<void> {
    const set = this.listings.get(userId) ?? new Set<string>();
    set.add(listingId);
    this.listings.set(userId, set);
  }

  async unsaveListing(userId: string, listingId: string): Promise<void> {
    this.listings.get(userId)?.delete(listingId);
  }

  async listSearches(userId: string): Promise<SavedSearch[]> {
    return this.searches.get(userId) ?? [];
  }

  async createSearch(search: SavedSearch): Promise<SavedSearch> {
    const list = this.searches.get(search.userId) ?? [];
    list.push(search);
    this.searches.set(search.userId, list);
    return search;
  }

  async deleteSearch(userId: string, searchId: string): Promise<void> {
    const list = this.searches.get(userId) ?? [];
    this.searches.set(
      userId,
      list.filter((search) => search.id !== searchId),
    );
  }
}
