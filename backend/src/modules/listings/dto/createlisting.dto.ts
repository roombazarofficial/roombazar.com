import { z } from "zod";

export const createListingSchema = z.object({
  roomType: z.enum([
    "singleroom",
    "sharedroom",
    "pgbed",
    "rk1",
    "bhk1",
    "bhk2",
    "bhk3plus",
    "hostelbed",
  ]),
  postedBy: z.enum(["owner", "tenant", "agent"]),
  localitySlug: z.string().min(1),
  citySlug: z.string().min(1),

  rentPaise: z.number().int().min(50_000).max(100_000_000),
  depositPaise: z.number().int().min(0).max(500_000_000).default(0),
  maintenancePaise: z.number().int().min(0).max(10_000_000).nullable().default(null),
  billsIncluded: z.boolean().default(false),
  negotiable: z.boolean().default(false),

  /*
    Media already uploaded straight to Cloudinary. The client returns what
    Cloudinary reported rather than the file itself, so dimensions and size come
    from the provider instead of from the browser.
  */
  media: z
    .array(
      z.preprocess(
        (value) => {
          if (
            value === null ||
            typeof value !== "object" ||
            Array.isArray(value)
          ) {
            return value;
          }

          const media = value as Record<string, unknown>;
          return media.publicId || !media.id
            ? media
            : { ...media, publicId: media.id };
        },
        z.object({
          publicId: z.string().min(1),
          secureUrl: z.string().url(),
          kind: z.enum(["image", "video"]).default("image"),
          format: z.string().default(""),
          width: z.number().int().min(1),
          height: z.number().int().min(1),
          sizeBytes: z.number().int().min(1),
          durationSeconds: z.number().nullable().default(null),
        }),
      ),
    )
    .min(1)
    .max(12),

  title: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1500).default(""),

  furnishing: z.enum(["unfurnished", "semi", "full"]).default("unfurnished"),
  areaSqft: z.number().int().min(30).max(20_000).nullable().default(null),
  floor: z.number().int().min(-2).max(100).nullable().default(null),
  totalFloors: z.number().int().min(0).max(100).nullable().default(null),

  addressLine: z.string().trim().max(300).nullable().default(null),
  lat: z.number().min(-90).max(90).nullable().default(null),
  lng: z.number().min(-180).max(180).nullable().default(null),

  availableFrom: z.string().date(),
  minStayMonths: z.number().int().min(1).max(60).nullable().default(null),

  preferredTenant: z
    .array(
      z.enum([
        "family",
        "bachelormale",
        "bachelorfemale",
        "student",
        "workingprofessional",
        "any",
      ]),
    )
    .default([]),

  amenitySlugs: z.array(z.string().min(1)).max(40).default([]),
});

export type CreateListingDto = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.partial().omit({
  postedBy: true,
});

export type UpdateListingDto = z.infer<typeof updateListingSchema>;
