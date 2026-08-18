import { z } from "zod";

const draftMedia = z.object({
  publicId: z.string().min(1).max(300),
  secureUrl: z.string().url().max(2000),
  kind: z.enum(["image", "video"]).default("image"),
  format: z.string().max(20).default(""),
  width: z.number().int().min(0).max(100_000).default(0),
  height: z.number().int().min(0).max(100_000).default(0),
  sizeBytes: z.number().int().min(0).default(0),
  durationSeconds: z.number().nullable().default(null),
});

/*
  Deliberately looser than createListingSchema. A draft is saved after every
  step, so most of it is empty most of the time — rejecting a half-filled draft
  would make autosave fail for the entire first half of the wizard.

  It is still bounded and .strict(): every field has a length or range, and
  unknown keys are rejected, so the endpoint cannot be used as free storage for
  arbitrary JSON.
*/
export const listingDraftSchema = z
  .object({
    roomType: z.string().max(40).nullable().default(null),
    postedBy: z.string().max(40).nullable().default(null),

    title: z.string().max(200).default(""),
    description: z.string().max(2000).default(""),

    citySlug: z.string().max(100).nullable().default(null),
    localitySlug: z.string().max(100).nullable().default(null),
    addressLine: z.string().max(300).default(""),

    rentRupees: z.number().min(0).max(10_000_000).nullable().default(null),
    depositRupees: z.number().min(0).max(50_000_000).nullable().default(null),
    maintenanceRupees: z.number().min(0).max(1_000_000).nullable().default(null),
    billsIncluded: z.boolean().default(false),
    negotiable: z.boolean().default(false),

    furnishing: z.string().max(40).nullable().default(null),
    areaSqft: z.number().min(0).max(1_000_000).nullable().default(null),
    floor: z.number().min(-100).max(500).nullable().default(null),
    totalFloors: z.number().min(0).max(500).nullable().default(null),

    amenitySlugs: z.array(z.string().min(1).max(80)).max(60).default([]),
    preferredTenant: z.array(z.string().min(1).max(40)).max(20).default([]),

    availableFrom: z.string().max(40).nullable().default(null),
    minStayMonths: z.number().min(0).max(600).nullable().default(null),

    media: z.array(draftMedia).max(12).default([]),
  })
  .strict();

export type ListingDraftDto = z.infer<typeof listingDraftSchema>;
