export type RoomType =
  | "singleroom" | "sharedroom" | "pgbed" | "rk1"
  | "bhk1" | "bhk2" | "bhk3plus" | "hostelbed";

export type Furnishing = "unfurnished" | "semi" | "full";

export type PostedBy = "owner" | "tenant" | "agent";

export type ListingStatus =
  | "draft" | "pendingapproval" | "rejected" | "active"
  | "paused" | "taken" | "expired" | "suspended";

export type TenantPreference =
  | "family" | "bachelormale" | "bachelorfemale"
  | "student" | "workingprofessional" | "any";

export type MediaKind = "image" | "video";

export interface ListingPhoto {
  id: string;
  objectKey: string;
  secureUrl: string;
  kind: MediaKind;
  format: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationSeconds: number | null;
  blurhash: string | null;
  position: number;
  moderationState: "pending" | "ok" | "rejected";
}

export interface Listing {
  id: string;
  slug: string;
  ownerId: string;
  status: ListingStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedByUserId: string | null;
  rejectedAt: string | null;
  rejectedByUserId: string | null;
  rejectionReason: string | null;

  title: string;
  description: string;

  roomType: RoomType;
  postedBy: PostedBy;
  furnishing: Furnishing;

  rentPaise: number;
  depositPaise: number;
  maintenancePaise: number | null;
  billsIncluded: boolean;
  negotiable: boolean;

  cityId: string;
  localityId: string;

  addressLine: string | null;
  lat: number | null;
  lng: number | null;

  areaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;

  availableFrom: string;
  minStayMonths: number | null;
  preferredTenant: TenantPreference[];

  amenitySlugs: string[];
  photos: ListingPhoto[];

  viewCount: number;
  rankScore: number;

  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
