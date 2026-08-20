import { Injectable } from "@nestjs/common";
import { NotFound } from "src/common/errors/domain.errors";
import type { Listing, ListingStatus, RoomType } from "src/domain/listing.entity";
import type {
  ListingSearchCriteria,
  ListingAdminCriteria,
  ListingsRepository,
  Page,
} from "src/persistence/ports/listings.repository";
import { seedCities, seedLocalities } from "./geography.memory";

@Injectable()
export class MemoryListingsRepository implements ListingsRepository {
  private readonly rows = new Map<string, Listing>();

  async findById(id: string): Promise<Listing | null> {
    return this.rows.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Listing | null> {
    for (const listing of this.rows.values()) {
      if (listing.slug === slug) return listing;
    }
    return null;
  }

  async findByOwner(ownerId: string): Promise<Listing[]> {
    return [...this.rows.values()]
      .filter((listing) => listing.ownerId === ownerId && !listing.deletedAt)
      .sort(byNewest);
  }

  async search(criteria: ListingSearchCriteria): Promise<Page<Listing>> {
    let results = [...this.rows.values()].filter(
      (listing) => listing.status === "active" && !listing.deletedAt,
    );

    if (criteria.citySlug) {
      const city = seedCities.find((item) => item.slug === criteria.citySlug);
      results = city ? results.filter((l) => l.cityId === city.id) : [];
    }

    if (criteria.localitySlugs?.length) {
      const ids = new Set(
        seedLocalities
          .filter((locality) => criteria.localitySlugs!.includes(locality.slug))
          .map((locality) => locality.id),
      );
      results = results.filter((listing) => ids.has(listing.localityId));
    }

    if (criteria.roomTypes?.length) {
      const wanted = new Set(criteria.roomTypes);
      results = results.filter((listing) => wanted.has(listing.roomType));
    }

    if (criteria.furnishing?.length) {
      const wanted = new Set(criteria.furnishing);
      results = results.filter((listing) => wanted.has(listing.furnishing));
    }

    if (criteria.postedBy?.length) {
      const wanted = new Set(criteria.postedBy);
      results = results.filter((listing) => wanted.has(listing.postedBy));
    }

    if (criteria.minRentPaise !== undefined) {
      results = results.filter((l) => l.rentPaise >= criteria.minRentPaise!);
    }

    if (criteria.maxRentPaise !== undefined) {
      results = results.filter((l) => l.rentPaise <= criteria.maxRentPaise!);
    }

    if (criteria.amenitySlugs?.length) {
      results = results.filter((listing) =>
        criteria.amenitySlugs!.every((slug) =>
          listing.amenitySlugs.includes(slug),
        ),
      );
    }

    if (criteria.availableFrom) {
      results = results.filter(
        (listing) => listing.availableFrom <= criteria.availableFrom!,
      );
    }

    if (criteria.occupancy !== undefined) {
      const people = criteria.occupancy;
      results = results.filter((listing) =>
        suitsOccupancy(listing.roomType, people),
      );
    }

    results = sortListings(results, criteria.sort ?? "relevance");

    const start = (criteria.page - 1) * criteria.pageSize;

    return {
      items: results.slice(start, start + criteria.pageSize),
      page: criteria.page,
      pageSize: criteria.pageSize,
      totalItems: results.length,
      totalPages: Math.max(1, Math.ceil(results.length / criteria.pageSize)),
    };
  }

  async findSimilar(listing: Listing, limit: number): Promise<Listing[]> {
    const others = [...this.rows.values()].filter(
      (candidate) =>
        candidate.id !== listing.id &&
        candidate.status === "active" &&
        !candidate.deletedAt,
    );

    const sameLocality = others.filter(
      (candidate) => candidate.localityId === listing.localityId,
    );
    const sameCity = others.filter(
      (candidate) =>
        candidate.localityId !== listing.localityId &&
        candidate.cityId === listing.cityId,
    );

    return [...sameLocality, ...sameCity].slice(0, limit);
  }

  async findForAdmin(criteria: ListingAdminCriteria): Promise<Page<Listing>> {
    let results = [...this.rows.values()].filter((listing) => !listing.deletedAt);
    if (criteria.statuses?.length) {
      results = results.filter((listing) =>
        criteria.statuses!.includes(listing.status),
      );
    }
    if (criteria.ownerId) {
      results = results.filter((listing) => listing.ownerId === criteria.ownerId);
    }
    if (criteria.citySlug) {
      const city = seedCities.find((item) => item.slug === criteria.citySlug);
      results = city ? results.filter((listing) => listing.cityId === city.id) : [];
    }
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter((listing) =>
        `${listing.title} ${listing.description} ${listing.slug}`
          .toLowerCase()
          .includes(query),
      );
    }

    results =
      criteria.sort === "oldest"
        ? results.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        : criteria.sort === "rentlow"
          ? results.sort((a, b) => a.rentPaise - b.rentPaise)
          : criteria.sort === "renthigh"
            ? results.sort((a, b) => b.rentPaise - a.rentPaise)
            : results.sort(byNewest);

    const start = (criteria.page - 1) * criteria.pageSize;
    return {
      items: results.slice(start, start + criteria.pageSize),
      page: criteria.page,
      pageSize: criteria.pageSize,
      totalItems: results.length,
      totalPages: Math.max(1, Math.ceil(results.length / criteria.pageSize)),
    };
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const listing of this.rows.values()) {
      if (!listing.deletedAt) counts[listing.status] = (counts[listing.status] ?? 0) + 1;
    }
    return counts;
  }

  async create(listing: Listing): Promise<Listing> {
    this.rows.set(listing.id, listing);
    return listing;
  }

  async update(id: string, patch: Partial<Listing>): Promise<Listing> {
    const existing = this.rows.get(id);
    if (!existing) throw new NotFound("Listing");

    const updated = { ...existing, ...patch };
    this.rows.set(id, updated);
    return updated;
  }

  async setStatus(id: string, status: ListingStatus): Promise<Listing> {
    return this.update(id, { status, updatedAt: new Date().toISOString() });
  }

  async incrementViewCount(id: string): Promise<void> {
    const existing = this.rows.get(id);
    if (!existing) return;

    this.rows.set(id, { ...existing, viewCount: existing.viewCount + 1 });
  }

  async countActiveByOwner(ownerId: string): Promise<number> {
    return [...this.rows.values()].filter(
      (listing) =>
        listing.ownerId === ownerId &&
        !listing.deletedAt &&
        (listing.status === "active" || listing.status === "paused"),
    ).length;
  }

  async findExpired(now: string): Promise<Listing[]> {
    return [...this.rows.values()].filter(
      (listing) =>
        listing.status === "active" &&
        listing.expiresAt !== null &&
        listing.expiresAt <= now,
    );
  }

  async findActiveInCity(cityId: string): Promise<Listing[]> {
    return [...this.rows.values()].filter(
      (listing) =>
        listing.cityId === cityId &&
        listing.status === "active" &&
        !listing.deletedAt,
    );
  }

  seed(listings: Listing[]): void {
    for (const listing of listings) this.rows.set(listing.id, listing);
  }
}

function suitsOccupancy(roomType: RoomType, people: number): boolean {
  const capacity: Record<RoomType, number> = {
    pgbed: 1,
    hostelbed: 1,
    sharedroom: 1,
    singleroom: 2,
    rk1: 2,
    bhk1: 3,
    bhk2: 4,
    bhk3plus: 6,
  };

  return capacity[roomType] >= people;
}

function sortListings(
  items: Listing[],
  sort: NonNullable<ListingSearchCriteria["sort"]>,
): Listing[] {
  const sorted = [...items];

  switch (sort) {
    case "rentlow":
      return sorted.sort((a, b) => a.rentPaise - b.rentPaise);
    case "renthigh":
      return sorted.sort((a, b) => b.rentPaise - a.rentPaise);
    case "newest":
      return sorted.sort(byNewest);
    case "relevance":
    default:
      return sorted.sort(
        (a, b) => b.rankScore - a.rankScore || byNewest(a, b),
      );
  }
}

function byNewest(a: Listing, b: Listing): number {
  return (
    new Date(b.publishedAt ?? b.createdAt).getTime() -
    new Date(a.publishedAt ?? a.createdAt).getTime()
  );
}
