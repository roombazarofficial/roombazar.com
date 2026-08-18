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

  citySlug: string | null;
  localitySlug: string | null;
  addressLine: string;

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

const emptyDraft: ListingDraft = {
  roomType: null,
  postedBy: null,
  title: "",
  description: "",
  /*
    No default city. Pre-selecting one that the API may not return leaves the
    control showing a blank box, because a select whose value matches no option
    renders as empty rather than falling back to the placeholder.
  */
  citySlug: null,
  localitySlug: null,
  addressLine: "",
  rentRupees: null,
  depositRupees: null,
  maintenanceRupees: null,
  billsIncluded: false,
  negotiable: false,
  furnishing: null,
  areaSqft: null,
  floor: null,
  totalFloors: null,
  amenitySlugs: [],
  preferredTenant: [],
  availableFrom: null,
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
    media: Array.isArray(merged.media) ? merged.media : [],
    amenitySlugs: Array.isArray(merged.amenitySlugs) ? merged.amenitySlugs : [],
    preferredTenant: Array.isArray(merged.preferredTenant)
      ? merged.preferredTenant
      : [],
  };
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
  One source of truth for what a listing still needs. The preview step used to
  keep its own copy of this list, so a field could be required by one and not
  the other — and availableFrom was in neither, even though the API rejects a
  listing without it.
*/
export function missingFields(draft: ListingDraft): string[] {
  return [
    !draft.roomType && "room type",
    !draft.postedBy && "who is posting",
    !draft.citySlug && "city",
    !draft.localitySlug && "locality",
    !draft.rentRupees && "monthly rent",
    !draft.availableFrom && "available from date",
    draft.media.length === 0 && "at least one photo",
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
  availableFrom: string;
  minStayMonths: number | null;
  preferredTenant: TenantPreference[];
  amenitySlugs: string[];
}

/*
  Rupees are converted to paise here, at the one boundary where the draft
  becomes an API request. Money is integer paise everywhere server-side, so
  rounding once at the edge keeps a fractional rupee from ever reaching it.
*/
export function draftToPayload(draft: ListingDraft): CreateListingPayload {
  const gaps = missingFields(draft);
  if (gaps.length > 0) {
    throw new Error(`Draft is missing ${gaps.join(", ")}.`);
  }

  return {
    roomType: draft.roomType as RoomType,
    postedBy: draft.postedBy as PostedBy,
    citySlug: draft.citySlug as string,
    localitySlug: draft.localitySlug as string,
    rentPaise: Math.round((draft.rentRupees as number) * 100),
    depositPaise: Math.round((draft.depositRupees ?? 0) * 100),
    maintenancePaise:
      draft.maintenanceRupees == null
        ? null
        : Math.round(draft.maintenanceRupees * 100),
    billsIncluded: draft.billsIncluded,
    negotiable: draft.negotiable,
    media: draft.media,
    title: draft.title.trim() || undefined,
    description: draft.description.trim(),
    furnishing: draft.furnishing ?? "unfurnished",
    areaSqft: draft.areaSqft,
    floor: draft.floor,
    totalFloors: draft.totalFloors,
    addressLine: draft.addressLine.trim() || null,
    availableFrom: draft.availableFrom as string,
    minStayMonths: draft.minStayMonths,
    preferredTenant: draft.preferredTenant,
    amenitySlugs: draft.amenitySlugs,
  };
}
