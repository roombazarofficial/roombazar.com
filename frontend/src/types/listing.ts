import type { Photo } from "./photo";
import type { Locality } from "./locality";
import type { City } from "./city";
import type { Amenity } from "./amenity";
import type { PublicUser } from "./user";

/**
 * The central entity. Mirrors docs/01-data-model.md — when this file and that
 * document disagree, the document wins and this file is the bug.
 *
 * Money is always integer paise. 1500000 is ₹15,000. Never a float, never a
 * pre-formatted string.
 */

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

/** Declared by the lister and shown as a badge. Seekers filter on this — it
 *  is the single most requested filter in this market. */
export type PostedBy = "owner" | "tenant" | "agent";

export type ListingStatus =
  | "draft"
  | "active"
  | "paused"
  | "taken"
  | "expired"
  | "suspended";

/**
 * Closed set by design. Free-text tenant preferences in this market routinely
 * encode caste and religion filters; a fixed enum makes that impossible to
 * express in structured data. See docs/03-trust-and-safety.md.
 */
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
  /** Null means maintenance is included in the rent. */
  maintenancePaise: number | null;
  billsIncluded: boolean;
  negotiable: boolean;

  city: City;
  locality: Locality;
  /**
   * Fuzzed to roughly a 300m radius and rendered as a circle, never a pin.
   * The exact position is never sent to a public client, and addressLine is
   * never sent at all. See docs/01-data-model.md.
   */
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

/**
 * The trimmed shape returned in search results. Deliberately smaller than a
 * full Listing — a results page renders 24 of these and must stay light on a
 * mobile connection.
 */
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
