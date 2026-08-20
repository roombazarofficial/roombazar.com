import type { Listing, ListingStatus } from "src/domain/listing.entity";
import { InvalidTransition } from "src/common/errors/domain.errors";

const allowed: Record<ListingStatus, ListingStatus[]> = {
  draft: ["pendingapproval", "active"],
  pendingapproval: ["active", "rejected"],
  rejected: ["pendingapproval"],
  active: ["taken", "expired", "paused", "suspended"],
  paused: ["active", "taken", "expired", "suspended"],
  taken: ["active", "suspended"],
  expired: ["active", "suspended"],
  suspended: [],
};

export function assertTransition(from: ListingStatus, to: ListingStatus): void {
  if (!allowed[from].includes(to)) {
    throw new InvalidTransition(from, to);
  }
}

export function canTransition(from: ListingStatus, to: ListingStatus): boolean {
  return allowed[from].includes(to);
}

const LISTING_DAYS = 30;

export function expiryFrom(publishedAt: Date): string {
  const expires = new Date(publishedAt);
  expires.setDate(expires.getDate() + LISTING_DAYS);
  return expires.toISOString();
}

export function requiresReconfirmation(status: ListingStatus): boolean {
  return status === "expired" || status === "taken";
}

export function missingRequiredFields(listing: Partial<Listing>): string[] {
  const missing: string[] = [];

  if (!listing.roomType) missing.push("roomType");
  if (!listing.postedBy) missing.push("postedBy");
  if (!listing.localityId) missing.push("localityId");
  if (!listing.rentPaise) missing.push("rentPaise");
  if (!listing.photos || listing.photos.length === 0) missing.push("photos");

  return missing;
}
