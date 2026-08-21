import { create } from "zustand";
import {
  saveListing,
  unsaveListing,
  fetchSavedListingIds,
  fetchSavedListings,
} from "@/lib/api/saved.client";
import type { ListingSummary } from "@/types/listing";

interface SavedStore {
  savedIds: Set<string>;
  savedListings: ListingSummary[];
  loading: boolean;
  loaded: boolean;

  fetchSavedIds: () => Promise<void>;
  fetchSavedListings: () => Promise<ListingSummary[]>;
  isSaved: (listingId: string) => boolean;
  toggleSave: (listingId: string) => Promise<boolean>;
  setSavedIds: (ids: string[]) => void;
  reset: () => void;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedIds: new Set<string>(),
  savedListings: [],
  loading: false,
  loaded: false,

  fetchSavedIds: async () => {
    try {
      const ids = await fetchSavedListingIds();
      set({
        savedIds: new Set(Array.isArray(ids) ? ids : []),
        loaded: true,
      });
    } catch {
      // Unauthenticated or network error — ignore
    }
  },

  fetchSavedListings: async () => {
    set({ loading: true });
    try {
      const listings = await fetchSavedListings();
      const valid = Array.isArray(listings)
        ? listings.filter(
            (item): item is ListingSummary =>
              Boolean(item && typeof item === "object" && item.id && item.title),
          )
        : [];
      set({
        savedListings: valid,
        savedIds: new Set(valid.map((l) => l.id)),
        loaded: true,
        loading: false,
      });
      return valid;
    } catch {
      set({ loading: false });
      return [];
    }
  },

  isSaved: (listingId: string) => {
    return get().savedIds.has(listingId);
  },

  toggleSave: async (listingId: string) => {
    const { savedIds } = get();
    const wasSaved = savedIds.has(listingId);
    const nextSavedIds = new Set(savedIds);

    // Optimistic UI update
    if (wasSaved) {
      nextSavedIds.delete(listingId);
    } else {
      nextSavedIds.add(listingId);
    }
    set({ savedIds: nextSavedIds });

    try {
      if (wasSaved) {
        await unsaveListing(listingId);
      } else {
        await saveListing(listingId);
      }
      return !wasSaved;
    } catch (err) {
      // Revert optimistic update on failure
      set({ savedIds: new Set(savedIds) });
      throw err;
    }
  },

  setSavedIds: (ids: string[]) => {
    set({ savedIds: new Set(ids), loaded: true });
  },

  reset: () => {
    set({ savedIds: new Set(), savedListings: [], loaded: false });
  },
}));
