import type { Photo } from "./photo";
import type { Locality } from "./locality";
import type { City } from "./city";
import type { Amenity } from "./amenity";
import type { PublicUser } from "./user";

export type RoomType =
  | "singleroom"
  | "sharedroom"
  | "pgbed"
  | "rk1"
  | "bhk1"
  | "bhk2"
  | "bhk3plus"
  | "hostelbed";

export type Furnishing = "unfurnished" | "semi" | "full";

export type PostedBy = "owner" | "tenant" | "agent";

export type ListingStatus =
  | "draft"
  | "pendingapproval"
  | "rejected"
  | "active"
  | "paused"
  | "taken"
  | "expired"
  | "suspended";

export type TenantPreference =
  | "family"
  | "bachelormale"
  | "bachelorfemale"
  | "student"
  | "workingprofessional"
  | "any";

export interface Listing {
  id: string;
  slug: string;
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

  city: City;
  locality: Locality;
  approximateLat: number | null;
  approximateLng: number | null;

  areaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;

  availableFrom: string;
  minStayMonths: number | null;
  preferredTenant: TenantPreference[];

  amenities: Amenity[];
  photos: Photo[];

  lister: PublicUser;

  viewCount: number;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListingSummary {
  id: string;
  slug: string;
  title: string;
  roomType: RoomType;
  postedBy: PostedBy;
  furnishing: Furnishing;
  rentPaise: number;
  depositPaise: number;
  billsIncluded: boolean;
  cityName: string;
  citySlug: string;
  localityName: string;
  localitySlug: string;
  coverPhoto: Photo | null;
  photoCount: number;
  availableFrom: string;
  publishedAt: string;
  listerVerified: boolean;
  isSaved: boolean;
}
