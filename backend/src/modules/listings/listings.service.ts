import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  Forbidden,
  NotFound,
  TrustLevelTooLow,
  ValidationFailed,
} from "src/common/errors/domain.errors";
import { policyFor } from "src/common/trustlevels";
import type { Listing, ListingPhoto } from "src/domain/listing.entity";
import type { User } from "src/domain/user.entity";
import { assertTransition, expiryFrom } from "./listinglifecycle";
import { computeRankScore } from "./ranking";
import type { CreateListingDto, UpdateListingDto } from "./dto/createlisting.dto";

@Injectable()
export class ListingsService {
  constructor(
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(GEOGRAPHY_REPOSITORY) private readonly geography: GeographyRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  async getBySlug(slug: string): Promise<Listing> {
    const listing = await this.listings.findBySlug(slug);

    if (!listing || listing.deletedAt) throw new NotFound("Listing");

    if (listing.status === "suspended") throw new NotFound("Listing");

    return listing;
  }

  async getOwned(id: string, owner: User): Promise<Listing> {
    const listing = await this.listings.findById(id);

    if (!listing || listing.deletedAt) throw new NotFound("Listing");

    if (listing.ownerId !== owner.id && owner.role === "user") {
      throw new NotFound("Listing");
    }

    return listing;
  }

  async listMine(owner: User): Promise<Listing[]> {
    return this.listings.findByOwner(owner.id);
  }

  async create(dto: CreateListingDto, owner: User): Promise<Listing> {
    const policy = policyFor(owner.trustLevel);

    if (policy.maxActiveListings === 0) {
      throw new TrustLevelTooLow(
        "Your account cannot post new rooms at the moment.",
      );
    }

    const existing = await this.listings.findByOwner(owner.id);
    const active = existing.filter(
      (listing) => listing.status === "active" || listing.status === "paused",
    );

    if (active.length >= policy.maxActiveListings) {
      throw new TrustLevelTooLow(
        `You can have ${policy.maxActiveListings} active rooms. Mark one as taken to post another.`,
      );
    }

    const city = await this.geography.findCityBySlug(dto.citySlug);
    if (!city) throw new ValidationFailed("Unknown city", { citySlug: "Not recognised" });

    const locality = await this.geography.findLocalityBySlug(
      city.id,
      dto.localitySlug,
    );
    if (!locality) {
      throw new ValidationFailed("Unknown locality", {
        localitySlug: "Pick a locality from the list",
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    /*
      Dimensions and size come from Cloudinary's response rather than from the
      browser, so a client cannot claim a 20MB video is a thumbnail.
    */
    const photos: ListingPhoto[] = dto.media.map((item, index) => ({
      id: randomUUID(),
      objectKey: item.publicId,
      secureUrl: item.secureUrl,
      kind: item.kind,
      format: item.format,
      contentType: `${item.kind}/${item.format || "jpeg"}`,
      sizeBytes: item.sizeBytes,
      width: item.width,
      height: item.height,
      durationSeconds: item.durationSeconds,
      blurhash: null,
      position: index,
      moderationState: "pending",
    }));

    const title =
      dto.title?.trim() ||
      generateTitle(dto.roomType, locality.name);

    const listing: Listing = {
      id: randomUUID(),
      slug: buildSlug(title, locality.slug),
      ownerId: owner.id,
      status: "active",
      title,
      description: dto.description,
      roomType: dto.roomType,
      postedBy: dto.postedBy,
      furnishing: dto.furnishing,
      rentPaise: dto.rentPaise,
      depositPaise: dto.depositPaise,
      maintenancePaise: dto.maintenancePaise,
      billsIncluded: dto.billsIncluded,
      negotiable: dto.negotiable,
      cityId: city.id,
      localityId: locality.id,
      addressLine: dto.addressLine,
      lat: dto.lat,
      lng: dto.lng,
      areaSqft: dto.areaSqft,
      floor: dto.floor,
      totalFloors: dto.totalFloors,
      availableFrom: dto.availableFrom,
      minStayMonths: dto.minStayMonths,
      preferredTenant: dto.preferredTenant,
      amenitySlugs: dto.amenitySlugs,
      photos,
      viewCount: 0,
      rankScore: 0,
      publishedAt: nowIso,
      expiresAt: expiryFrom(now),
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
    };

    listing.rankScore = computeRankScore(listing, owner.trustLevel, now);

    return this.listings.create(listing);
  }

  async update(
    id: string,
    dto: UpdateListingDto,
    owner: User,
  ): Promise<Listing> {
    const listing = await this.getOwned(id, owner);

    const patch: Partial<Listing> = {
      ...stripUndefined({
        title: dto.title,
        description: dto.description,
        roomType: dto.roomType,
        furnishing: dto.furnishing,
        rentPaise: dto.rentPaise,
        depositPaise: dto.depositPaise,
        maintenancePaise: dto.maintenancePaise,
        billsIncluded: dto.billsIncluded,
        negotiable: dto.negotiable,
        addressLine: dto.addressLine,
        lat: dto.lat,
        lng: dto.lng,
        areaSqft: dto.areaSqft,
        floor: dto.floor,
        totalFloors: dto.totalFloors,
        availableFrom: dto.availableFrom,
        minStayMonths: dto.minStayMonths,
        preferredTenant: dto.preferredTenant,
        amenitySlugs: dto.amenitySlugs,
      }),
      updatedAt: new Date().toISOString(),
    };

    const merged = { ...listing, ...patch };
    patch.rankScore = computeRankScore(merged, owner.trustLevel);

    return this.listings.update(id, patch);
  }

  async markTaken(id: string, owner: User): Promise<Listing> {
    const listing = await this.getOwned(id, owner);
    assertTransition(listing.status, "taken");
    return this.listings.setStatus(id, "taken");
  }

  async pause(id: string, owner: User): Promise<Listing> {
    const listing = await this.getOwned(id, owner);
    assertTransition(listing.status, "paused");
    return this.listings.setStatus(id, "paused");
  }

  async renew(
    id: string,
    owner: User,
    confirmation: { rentPaise: number; availableFrom: string },
  ): Promise<Listing> {
    const listing = await this.getOwned(id, owner);
    assertTransition(listing.status, "active");

    const now = new Date();

    return this.listings.update(id, {
      status: "active",
      rentPaise: confirmation.rentPaise,
      availableFrom: confirmation.availableFrom,
      publishedAt: now.toISOString(),
      expiresAt: expiryFrom(now),
      updatedAt: now.toISOString(),
    });
  }

  async recordView(id: string, viewer: User | null): Promise<void> {
    const listing = await this.listings.findById(id);
    if (!listing) return;

    if (viewer && viewer.id === listing.ownerId) return;

    await this.listings.incrementViewCount(id);
  }

  async softDelete(id: string, owner: User): Promise<void> {
    const listing = await this.getOwned(id, owner);

    if (listing.ownerId !== owner.id) throw new Forbidden();

    await this.listings.update(id, {
      deletedAt: new Date().toISOString(),
    });
  }

  async expireOverdue(): Promise<number> {
    const overdue = await this.listings.findExpired(new Date().toISOString());

    for (const listing of overdue) {
      await this.listings.setStatus(listing.id, "expired");
    }

    return overdue.length;
  }
}

function generateTitle(roomType: string, localityName: string): string {
  const labels: Record<string, string> = {
    singleroom: "Single room",
    sharedroom: "Shared room",
    pgbed: "PG bed",
    rk1: "1 RK",
    bhk1: "1 BHK",
    bhk2: "2 BHK",
    bhk3plus: "3+ BHK",
    hostelbed: "Hostel bed",
  };

  return `${labels[roomType] ?? "Room"} in ${localityName}`;
}

function buildSlug(title: string, localitySlug: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${base}-${localitySlug}-${randomUUID().slice(0, 6)}`;
}

function stripUndefined<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
