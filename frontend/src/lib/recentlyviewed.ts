"use client";

/**
 * Real per-browser view history, kept in localStorage — never fabricated.
 * Powers the homepage's "Recently viewed" section, which simply doesn't
 * render when this is empty.
 */

const STORAGE_KEY = "roombazar_recently_viewed";
const MAX_ENTRIES = 10;

export interface RecentlyViewedEntry {
  id: string;
  slug: string;
  title: string;
  coverPhotoUrl: string | null;
  rentPaise: number;
  cityName: string;
  localityName: string;
  viewedAt: string;
}

export function recordRecentlyViewed(
  entry: Omit<RecentlyViewedEntry, "viewedAt">,
): void {
  try {
    const existing = readAll().filter((e) => e.id !== entry.id);
    const next = [{ ...entry, viewedAt: new Date().toISOString() }, ...existing].slice(
      0,
      MAX_ENTRIES,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing / storage blocked — recently-viewed just won't persist.
  }
}

export function readRecentlyViewed(excludeId?: string): RecentlyViewedEntry[] {
  const all = readAll();
  return excludeId ? all.filter((e) => e.id !== excludeId) : all;
}

function readAll(): RecentlyViewedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
