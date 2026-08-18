import type { Listing } from "src/domain/listing.entity";
import { policyFor } from "src/common/trustlevels";
import type { TrustLevel } from "src/domain/user.entity";

export function computeRankScore(
  listing: Listing,
  listerTrust: TrustLevel,
  now: Date = new Date(),
): number {
  return (
    recencyScore(listing, now) * 0.4 +
    completenessScore(listing) * 0.35 +
    policyFor(listerTrust).rankingWeight * 0.25
  );
}

function recencyScore(listing: Listing, now: Date): number {
  const published = listing.publishedAt ?? listing.createdAt;
  const ageDays =
    (now.getTime() - new Date(published).getTime()) / (1000 * 60 * 60 * 24);

  return Math.max(0, Math.min(1, (30 - ageDays) / 30));
}

function completenessScore(listing: Listing): number {
  let score = 0;

  const photos = listing.photos.filter((photo) => photo.moderationState !== "rejected");
  if (photos.length >= 5) score += 0.35;
  else if (photos.length >= 3) score += 0.28;
  else if (photos.length >= 1) score += 0.12;

  if (listing.description.trim().length >= 120) score += 0.2;
  if (listing.amenitySlugs.length >= 6) score += 0.15;
  else if (listing.amenitySlugs.length >= 3) score += 0.08;

  if (listing.areaSqft) score += 0.08;
  if (listing.floor !== null) score += 0.04;
  if (listing.preferredTenant.length > 0) score += 0.04;
  if (listing.maintenancePaise !== null || listing.billsIncluded) score += 0.06;

  return Math.min(1, score);
}

export function isSuspiciouslyCheap(
  rentPaise: number,
  localityMedianPaise: number | null,
): boolean {
  if (!localityMedianPaise || localityMedianPaise <= 0) return false;

  return rentPaise < localityMedianPaise * 0.45;
}
