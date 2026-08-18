export type RoomType =
  | "singleroom" | "sharedroom" | "pgbed" | "rk1"
  | "bhk1" | "bhk2" | "bhk3plus" | "hostelbed";

export type Furnishing = "unfurnished" | "semi" | "full";

export type PostedBy = "owner" | "tenant" | "agent";

export type ListingStatus =
  | "draft" | "active" | "paused" | "taken" | "expired" | "suspended";

export type TenantPreference =
  | "family" | "bachelormale" | "bachelorfemale"
  | "student" | "workingprofessional" | "any";

export type MediaKind = "image" | "video";

export interface ListingPhoto {
  id: string;
  /** Cloudinary public_id. */
  objectKey: string;
  /** Delivery URL as Cloudinary returned it, stored rather than rebuilt. */
  secureUrl: string;
  kind: MediaKind;
  format: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  /** Videos only. */
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
