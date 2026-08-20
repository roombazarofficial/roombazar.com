import type { Prisma } from "@prisma/client";
import type { Listing, ListingPhoto } from "src/domain/listing.entity";
import type { User } from "src/domain/user.entity";
import type { Conversation, Message } from "src/domain/conversation.entity";
import type { Amenity, City, Locality } from "src/domain/geography.entity";
import type { ModerationAction, Report } from "src/domain/report.entity";

export const listingInclude = {
  property: {
    include: {
      address: true,
      organization: { select: { ownerUserId: true } },
    },
  },
  amenities: { select: { amenityId: true, amenity: { select: { slug: true } } } },
  media: {
    include: { media: true },
    orderBy: { position: "asc" },
  },
} as const;

type ListingRow = Prisma.ListingGetPayload<{ include: typeof listingInclude }>;

export function toDomainListing(row: ListingRow): Listing {
  return {
    id: row.id,
    slug: row.slug,
    ownerId: row.createdById,
    status: row.status,
    submittedAt: toIso(row.submittedAt),
    approvedAt: toIso(row.approvedAt),
    approvedByUserId: row.approvedByUserId,
    rejectedAt: toIso(row.rejectedAt),
    rejectedByUserId: row.rejectedByUserId,
    rejectionReason: row.rejectionReason,
    title: row.title,
    description: row.description,
    roomType: row.roomCategory,
    postedBy: row.postedBy,
    furnishing: row.furnishing,
    rentPaise: row.rentPaise,
    depositPaise: row.depositPaise,
    maintenancePaise: row.maintenancePaise,
    billsIncluded: row.billsIncluded,
    negotiable: row.negotiable,
    cityId: row.cityId,
    localityId: row.localityId,
    addressLine: row.property.address?.addressLine ?? null,
    lat: row.property.address?.latitude ?? null,
    lng: row.property.address?.longitude ?? null,
    areaSqft: row.areaSqft,
    floor: row.floorNumber,
    totalFloors: row.totalFloors,
    availableFrom: toDateString(row.availableFrom),
    minStayMonths: row.minStayMonths,
    preferredTenant: row.preferredTenant,
    amenitySlugs: row.amenities.map((join) => join.amenity.slug),
    photos: row.media.map(toDomainPhoto),
    viewCount: row.viewCount,
    rankScore: row.rankScore,
    publishedAt: toIso(row.publishedAt),
    expiresAt: toIso(row.expiresAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

function toDomainPhoto(join: ListingRow["media"][number]): ListingPhoto {
  return {
    id: join.media.id,
    objectKey: join.media.objectKey,
    secureUrl: join.media.secureUrl,
    kind: join.media.kind,
    format: join.media.format,
    contentType: join.media.contentType,
    sizeBytes: join.media.sizeBytes,
    width: join.media.width,
    height: join.media.height,
    durationSeconds: join.media.durationSeconds,
    blurhash: join.media.blurhash,
    position: join.position,
    moderationState: join.media.moderationState,
  };
}

type UserRow = Prisma.UserGetPayload<{
  include: { verifications: { select: { kind: true; status: true } } };
}>;

export const userInclude = {
  verifications: { select: { kind: true, status: true } },
} as const;

export function toDomainUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    emailVerifiedAt: toIso(row.emailVerifiedAt),
    passwordHash: row.passwordHash,
    phone: row.phone,
    phoneVerifiedAt: toIso(row.phoneVerifiedAt),
    name: row.name,
    avatarUrl: row.avatarUrl,
    role: row.platformRole,
    trustLevel: row.trustLevel,
    verifications: row.verifications
      .filter((entry) => entry.status === "approved")
      .map((entry) => entry.kind),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

export function toDomainConversation(
  row: Prisma.ConversationGetPayload<object>,
): Conversation {
  return {
    id: row.id,
    listingId: row.listingId,
    seekerId: row.seekerId,
    listerId: row.listerId,
    seekerRevealedAt: toIso(row.seekerRevealedAt),
    listerRevealedAt: toIso(row.listerRevealedAt),
    lastMessageAt: row.lastMessageAt.toISOString(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toDomainMessage(
  row: Prisma.MessageGetPayload<object>,
): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    body: row.body,
    redactedBody: row.redactedBody,
    readAt: toIso(row.readAt),
    hiddenAt: toIso(row.hiddenAt),
    createdAt: row.createdAt.toISOString(),
  };
}

export function toDomainCity(row: Prisma.CityGetPayload<object>): City {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    state: "",
    isActive: row.isActive,
    centroidLat: row.centroidLat,
    centroidLng: row.centroidLng,
  };
}

export function toDomainLocality(
  row: Prisma.LocalityGetPayload<object>,
): Locality {
  return {
    id: row.id,
    cityId: row.cityId,
    name: row.name,
    slug: row.slug,
    aliases: row.aliases,
    centroidLat: row.centroidLat,
    centroidLng: row.centroidLng,
  };
}

export function toDomainAmenity(
  row: Prisma.AmenityGetPayload<object>,
): Amenity {
  return {
    id: row.id,
    slug: row.slug,
    label: row.name,
    category: row.category,
  };
}

export function toDomainReport(row: Prisma.ReportGetPayload<object>): Report {
  return {
    id: row.id,
    reporterId: row.reporterId,
    targetType: row.targetType,
    targetId: row.targetId,
    reason: row.reason,
    detail: row.detail,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: toIso(row.resolvedAt),
  };
}

export function toDomainModerationAction(
  row: Prisma.ModerationActionGetPayload<object>,
): ModerationAction {
  return {
    id: row.id,
    moderatorId: row.moderatorId,
    targetType: row.targetType,
    targetId: row.targetId,
    action: row.action,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}
