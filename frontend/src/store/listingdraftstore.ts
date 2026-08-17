import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Furnishing,
  PostedBy,
  RoomType,
  TenantPreference,
} from "@/types/listing";

/**
 * The post wizard's working state.
 *
 * Persisted to localStorage on purpose: a lister filling this on a phone will
 * take a call, lose the tab, or run out of data halfway through. Losing eight
 * steps of work is the fastest way to lose a listing, and supply is the
 * harder side of this marketplace to grow.
 */
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

  photoIds: string[];
}

const emptyDraft: ListingDraft = {
  roomType: null,
  postedBy: null,
  title: "",
  description: "",
  citySlug: "bengaluru",
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
  photoIds: [],
};

interface DraftStore {
  draft: ListingDraft;
  update: (patch: Partial<ListingDraft>) => void;
  toggleAmenity: (slug: string) => void;
  reset: () => void;
}

export const useListingDraft = create<DraftStore>()(
  persist(
    (set) => ({
      draft: emptyDraft,

      update: (patch) =>
        set((state) => ({ draft: { ...state.draft, ...patch } })),

      toggleAmenity: (slug) =>
        set((state) => ({
          draft: {
            ...state.draft,
            amenitySlugs: state.draft.amenitySlugs.includes(slug)
              ? state.draft.amenitySlugs.filter((item) => item !== slug)
              : [...state.draft.amenitySlugs, slug],
          },
        })),

      reset: () => set({ draft: emptyDraft }),
    }),
    { name: "roombazar-listing-draft" },
  ),
);

/**
 * Only these five make a listing publishable. Everything else is optional by
 * design — each required field is paid for in lost supply, so the wizard has
 * to stay finishable in about three minutes. See docs/04-roadmap.md.
 */
export function isPublishable(draft: ListingDraft): boolean {
  return Boolean(
    draft.roomType &&
      draft.postedBy &&
      draft.localitySlug &&
      draft.rentRupees &&
      draft.photoIds.length > 0,
  );
}
