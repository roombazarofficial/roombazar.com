import type { Listing } from "src/domain/listing.entity";
import type { City, Locality, Amenity } from "src/domain/geography.entity";
import type { User } from "src/domain/user.entity";
import { fuzzCoordinates } from "src/common/geo";

export interface PhotoView {
  id: string;
  url: string;
  kind: "image" | "video";
  width: number;
  height: number;
  durationSeconds: number | null;
  blurhash: string | null;
  position: number;
}

/**
 * Serves the URL Cloudinary returned rather than rebuilding one from a host and
 * a key. Their delivery URLs carry version and transformation segments, and
 * reconstructing them by hand breaks the moment either changes.
 */
export function presentPhoto(
  photo: Listing["photos"][number],
  _publicImageHost: string,
): PhotoView {
  return {
    id: photo.id,
    url: photo.secureUrl,
    kind: photo.kind,
    width: photo.width,
    height: photo.height,
    durationSeconds: photo.durationSeconds,
    blurhash: photo.blurhash,
    position: photo.position,
  };
}

export function presentSummary(
  listing: Listing,
  city: City,
  locality: Locality,
  lister: User,
  imageHost: string,
  isSaved: boolean,
) {
  const visible = listing.photos
    .filter((photo) => photo.moderationState !== "rejected")
    .sort((a, b) => a.position - b.position);

  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    roomType: listing.roomType,
    postedBy: listing.postedBy,
    furnishing: listing.furnishing,
    rentPaise: listing.rentPaise,
    depositPaise: listing.depositPaise,
    billsIncluded: listing.billsIncluded,
    cityName: city.name,
    citySlug: city.slug,
    localityName: locality.name,
    localitySlug: locality.slug,
    coverPhoto: visible[0] ? presentPhoto(visible[0], imageHost) : null,
    photoCount: visible.length,
    availableFrom: listing.availableFrom,
    publishedAt: listing.publishedAt ?? listing.createdAt,
    listerVerified: lister.verifications.includes("governmentid"),
    isSaved,
  };
}

export function presentDetail(
  listing: Listing,
  city: City,
  locality: Locality,
  lister: User,
  listerStats: PublicUserStats,
  amenities: Amenity[],
  imageHost: string,
) {
  const fuzzed = fuzzCoordinates(listing.lat, listing.lng, listing.id);

  return {
    id: listing.id,
    slug: listing.slug,
    status: listing.status,
    title: listing.title,
    description: listing.description,
    roomType: listing.roomType,
    postedBy: listing.postedBy,
    furnishing: listing.furnishing,
    rentPaise: listing.rentPaise,
    depositPaise: listing.depositPaise,
    maintenancePaise: listing.maintenancePaise,
    billsIncluded: listing.billsIncluded,
    negotiable: listing.negotiable,
    city,
    locality,

    approximateLat: fuzzed.lat,
    approximateLng: fuzzed.lng,

    areaSqft: listing.areaSqft,
    floor: listing.floor,
    totalFloors: listing.totalFloors,
    availableFrom: listing.availableFrom,
    minStayMonths: listing.minStayMonths,
    preferredTenant: listing.preferredTenant,

    amenities: amenities.filter((amenity) =>
      listing.amenitySlugs.includes(amenity.slug),
    ),
    photos: listing.photos
      .filter((photo) => photo.moderationState !== "rejected")
      .sort((a, b) => a.position - b.position)
      .map((photo) => presentPhoto(photo, imageHost)),

    lister: presentPublicUser(lister, listerStats),

    viewCount: listing.viewCount,
    publishedAt: listing.publishedAt,
    expiresAt: listing.expiresAt,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

export interface PublicUserStats {
  activeListingCount: number;
  typicalReplyHours: number | null;
}

export function presentPublicUser(user: User, stats: PublicUserStats) {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    trustLevel: user.trustLevel,
    verifications: user.verifications,
    joinedAt: user.createdAt,
    typicalReplyHours: stats.typicalReplyHours,
    activeListingCount: stats.activeListingCount,
  };
}
