import { z } from "zod";

const draftMedia = z.preprocess(
  (value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }

    const media = value as Record<string, unknown>;
    return media.publicId || !media.id
      ? media
      : { ...media, publicId: media.id };
  },
  z.object({
    publicId: z.string().min(1).max(300),
    secureUrl: z.string().url().max(2000),
    kind: z.enum(["image", "video"]).default("image"),
    format: z.string().max(20).default(""),
    width: z.number().int().min(0).max(100_000).default(0),
    height: z.number().int().min(0).max(100_000).default(0),
    sizeBytes: z.number().int().min(0).default(0),
    durationSeconds: z.number().nullable().default(null),
  }),
);

const nullableString = (max: number) =>
  z.string().max(max).nullable().default(null).catch(null);

const stringValue = (max: number) =>
  z.string().max(max).default("").catch("");

const nullableNumber = (minimum: number, maximum: number) =>
  z.number().min(minimum).max(maximum).nullable().default(null).catch(null);

const stringList = (itemMax: number, listMax: number) =>
  z
    .preprocess(
      (value) =>
        Array.isArray(value)
          ? value
              .filter((item): item is string => typeof item === "string")
              .slice(0, listMax)
          : [],
      z.array(z.string().min(1).max(itemMax)).max(listMax),
    )
    .catch([]);

/*
  Deliberately looser than createListingSchema. A draft is saved after every
  step, so most of it is empty most of the time — rejecting a half-filled draft
  would make autosave fail for the entire first half of the wizard.

  Every accepted field is still bounded. Unknown keys from an older wizard
  version are stripped so a saved draft can migrate itself on its next save
  instead of making autosave fail forever.
*/
export const listingDraftSchema = z
  .object({
    roomType: nullableString(40),
    postedBy: nullableString(40),

    title: stringValue(200),
    description: stringValue(2000),

    stateCode: nullableString(20),
    districtSlug: nullableString(100),
    citySlug: nullableString(100),
    localitySlug: nullableString(100),
    addressLine: stringValue(300),

    rentRupees: nullableNumber(0, 10_000_000),
    depositRupees: nullableNumber(0, 50_000_000),
    maintenanceRupees: nullableNumber(0, 1_000_000),
    billsIncluded: z.boolean().default(false).catch(false),
    negotiable: z.boolean().default(false).catch(false),

    furnishing: nullableString(40),
    areaSqft: nullableNumber(0, 1_000_000),
    floor: nullableNumber(-100, 500),
    totalFloors: nullableNumber(0, 500),

    amenitySlugs: stringList(80, 60),
    preferredTenant: stringList(40, 20),

    availableFrom: nullableString(40),
    minStayMonths: nullableNumber(0, 600),

    media: z.array(draftMedia).max(12).default([]).catch([]),
  })
  .strip();

export type ListingDraftDto = z.infer<typeof listingDraftSchema>;
