import { create } from "zustand";
import type { UploadedMedia } from "@/lib/api/uploads";
import type {
  Furnishing,
  PostedBy,
  RoomType,
  TenantPreference,
} from "@/types/listing";

export interface ListingDraft {
  roomType: RoomType | null;
  postedBy: PostedBy | null;
  title: string;
  description: string;

  stateCode: string | null;
  districtSlug: string | null;
  citySlug: string | null;
  localitySlug: string | null;
  addressLine: string;
  lat: number | null;
  lng: number | null;

  rentRupees: number | null;
  depositRupees: number | null;
  maintenanceRupees: number | null;
  billsIncluded: boolean;
  negotiable: boolean;

  furnishing: Furnishing | null;
  areaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;

  amenitySlugs: string[];
  preferredTenant: TenantPreference[];

  availableFrom: string | null;
  minStayMonths: number | null;

  /*
    Finished uploads, not pending ones. A file still in flight lives in the
    photos step's local state, so a half-finished upload cannot be restored
    from storage as though it had completed.
  */
  media: UploadedMedia[];
}

const todayDateStr: string = new Date().toISOString().slice(0, 10);

const emptyDraft: ListingDraft = {
  roomType: null,
  postedBy: "owner",
  title: "",
  description: "",
  /*
    No default city. Pre-selecting one that the API may not return leaves the
    control showing a blank box, because a select whose value matches no option
    renders as empty rather than falling back to the placeholder.
  */
  stateCode: null,
  districtSlug: null,
  citySlug: null,
  localitySlug: null,
  addressLine: "",
  lat: null,
  lng: null,
  rentRupees: null,
  depositRupees: null,
  maintenanceRupees: null,
  billsIncluded: false,
  negotiable: false,
  furnishing: "unfurnished",
  areaSqft: null,
  floor: null,
  totalFloors: null,
  amenitySlugs: [],
  preferredTenant: [],
  availableFrom: todayDateStr,
  minStayMonths: null,
  media: [],
};

interface DraftStore {
  draft: ListingDraft;
  /*
    False until the saved draft has been fetched from the API.

    The server renders an empty draft, so the first client render has to match
    it exactly, and nothing may be autosaved before this turns true — saving
    early would overwrite the stored draft with a blank one.
  */
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  replace: (data: Partial<ListingDraft>) => void;
  update: (patch: Partial<ListingDraft>) => void;
  toggleAmenity: (slug: string) => void;
  addMedia: (item: UploadedMedia) => void;
  removeMedia: (publicId: string) => void;
  reset: () => void;
}

/*
  A draft loaded from the API is merged over the empty one, and its three array
  fields are checked rather than trusted. The row is JSON written by an older
  build of the wizard, so a field this build expects may simply not be there.
*/
export function normaliseDraft(data: Partial<ListingDraft>): ListingDraft {
  const merged = { ...emptyDraft, ...data };

  return {
    ...merged,
    postedBy: merged.postedBy || "owner",
    availableFrom: merged.availableFrom || todayDateStr,
    furnishing: merged.furnishing || "unfurnished",
    districtSlug: merged.districtSlug ?? merged.citySlug,
    lat: typeof merged.lat === "number" && !isNaN(merged.lat) ? merged.lat : null,
    lng: typeof merged.lng === "number" && !isNaN(merged.lng) ? merged.lng : null,
    media: normaliseMedia(merged.media),
    amenitySlugs: Array.isArray(merged.amenitySlugs) ? merged.amenitySlugs : [],
    preferredTenant: Array.isArray(merged.preferredTenant)
      ? merged.preferredTenant
      : [],
  };
}

function normaliseMedia(value: unknown): UploadedMedia[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (entry === null || typeof entry !== "object") return [];

    const media = entry as UploadedMedia & { id?: string };
    const publicId = media.publicId ?? media.id;

    return publicId && media.secureUrl
      ? [{ ...media, publicId }]
      : [];
  });
}

export const useListingDraft = create<DraftStore>()((set) => ({
  draft: emptyDraft,
  hydrated: false,

  setHydrated: (value) => set({ hydrated: value }),

  replace: (data) => set({ draft: normaliseDraft(data) }),

  update: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),

  toggleAmenity: (slug) =>
    set((state) => ({
      draft: {
        ...state.draft,
        amenitySlugs: state.draft.amenitySlugs.includes(slug)
          ? state.draft.amenitySlugs.filter((item) => item !== slug)
          : [...state.draft.amenitySlugs, slug],
      },
    })),

  addMedia: (item) =>
    set((state) => ({
      draft: { ...state.draft, media: [...state.draft.media, item] },
    })),

  removeMedia: (publicId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        media: state.draft.media.filter((entry) => entry.publicId !== publicId),
      },
    })),

  reset: () => set({ draft: emptyDraft }),
}));

/*
  One source of truth for what a listing still needs.
  Compressed to minimal essential questions:
  1. Room Type
  2. Location (City & Locality)
  3. Monthly Rent
  4. At least one photo
*/
export function missingFields(draft: ListingDraft): string[] {
  return [
    !draft.roomType && "Room Type",
    (!draft.stateCode || !draft.districtSlug || !draft.localitySlug) &&
      "Location (State, District & City)",
    (!draft.rentRupees || draft.rentRupees <= 0) && "Monthly Rent",
    draft.media.length === 0 && "At least 1 photo",
  ].filter(Boolean) as string[];
}

export function isPublishable(draft: ListingDraft): boolean {
  return missingFields(draft).length === 0;
}

export interface CreateListingPayload {
  roomType: RoomType;
  postedBy: PostedBy;
  citySlug: string;
  localitySlug: string;
  rentPaise: number;
  depositPaise: number;
  maintenancePaise: number | null;
  billsIncluded: boolean;
  negotiable: boolean;
  media: UploadedMedia[];
  title?: string;
  description: string;
  furnishing: Furnishing;
  areaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;
  addressLine: string | null;
  lat: number | null;
  lng: number | null;
  availableFrom: string;
  minStayMonths: number | null;
  preferredTenant: TenantPreference[];
  amenitySlugs: string[];
}

/*
  Rupees are converted to paise here, at the one boundary where the draft
  becomes an API request.
*/
export function draftToPayload(draft: ListingDraft): CreateListingPayload {
  const gaps = missingFields(draft);
  if (gaps.length > 0) {
    throw new Error(`Please complete: ${gaps.join(", ")}.`);
  }

  // Validate coordinates within valid geographic bounds
  const validLat =
    typeof draft.lat === "number" &&
    !isNaN(draft.lat) &&
    draft.lat >= -90 &&
    draft.lat <= 90
      ? draft.lat
      : null;

  const validLng =
    typeof draft.lng === "number" &&
    !isNaN(draft.lng) &&
    draft.lng >= -180 &&
    draft.lng <= 180
      ? draft.lng
      : null;

  return {
    roomType: draft.roomType as RoomType,
    postedBy: (draft.postedBy || "owner") as PostedBy,
    citySlug: draft.citySlug || (draft.districtSlug as string),
    localitySlug: draft.localitySlug as string,
    rentPaise: Math.round((draft.rentRupees as number) * 100),
    depositPaise: Math.round((draft.depositRupees ?? 0) * 100),
    maintenancePaise:
      draft.maintenanceRupees == null
        ? null
        : Math.round(draft.maintenanceRupees * 100),
    billsIncluded: draft.billsIncluded ?? false,
    negotiable: draft.negotiable ?? false,
    media: normaliseMedia(draft.media),
    title: draft.title.trim() || undefined,
    description: draft.description.trim(),
    furnishing: draft.furnishing ?? "unfurnished",
    areaSqft: draft.areaSqft ?? null,
    floor: draft.floor ?? null,
    totalFloors: draft.totalFloors ?? null,
    addressLine: draft.addressLine.trim() || null,
    lat: validLat,
    lng: validLng,
    availableFrom: draft.availableFrom || todayDateStr,
    minStayMonths: draft.minStayMonths ?? null,
    preferredTenant: draft.preferredTenant ?? [],
    amenitySlugs: draft.amenitySlugs ?? [],
  };
}


