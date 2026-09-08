import type { Listing, ListingStatus } from "src/domain/listing.entity";

export const LISTINGS_REPOSITORY = Symbol("LISTINGS_REPOSITORY");

export interface ListingSearchCriteria {
  citySlug?: string;
  localitySlugs?: string[];
  roomTypes?: string[];
  furnishing?: string[];
  postedBy?: string[];
  amenitySlugs?: string[];
  minRentPaise?: number;
  maxRentPaise?: number;
  availableFrom?: string;
  occupancy?: number;
  sort?: "relevance" | "newest" | "rentlow" | "renthigh";
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * The minimal projection the public XML sitemap needs. Deliberately lean: no
 * photos, amenities or lister joins — the sitemap only emits URLs and dates.
 */
export interface SitemapListingEntry {
  slug: string;
  updatedAt: string;
  publishedAt: string | null;
  citySlug: string;
  cityName: string;
  localitySlug: string;
  localityName: string;
}

export interface ListingAdminCriteria {
  statuses?: ListingStatus[];
  ownerId?: string;
  citySlug?: string;
  query?: string;
  sort: "newest" | "oldest" | "rentlow" | "renthigh";
  page: number;
  pageSize: number;
}

export interface ListingsRepository {
  findById(id: string): Promise<Listing | null>;
  findBySlug(slug: string): Promise<Listing | null>;
  findByOwner(ownerId: string): Promise<Listing[]>;

  search(criteria: ListingSearchCriteria): Promise<Page<Listing>>;
  findForAdmin(criteria: ListingAdminCriteria): Promise<Page<Listing>>;
  countByStatus(): Promise<Record<string, number>>;

  findSimilar(listing: Listing, limit: number): Promise<Listing[]>;

  create(listing: Listing): Promise<Listing>;
  update(id: string, patch: Partial<Listing>): Promise<Listing>;
  setStatus(id: string, status: ListingStatus): Promise<Listing>;

  incrementViewCount(id: string): Promise<void>;

  /** Every publicly indexable listing, projected for the XML sitemap. */
  listSitemapEntries(): Promise<SitemapListingEntry[]>;

  countActiveByOwner(ownerId: string): Promise<number>;

  findExpired(now: string): Promise<Listing[]>;

  findActiveInCity(cityId: string): Promise<Listing[]>;
}
