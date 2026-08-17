import type { Amenity } from "@/types/amenity";
import type { City } from "@/types/city";
import type { Locality } from "@/types/locality";
import type { Listing, ListingSummary } from "@/types/listing";
import type { Photo } from "@/types/photo";
import type { PublicUser } from "@/types/user";

/**
 * Stand-in data for the frontend-first phase. Every shape here is the real
 * type, so when the backend arrives the only change is where the data comes
 * from — see docs/04-roadmap.md.
 *
 * Rents and localities are realistic Bengaluru figures. Fake data that is
 * obviously fake hides layout problems: a ₹1,00,000 rent and a locality named
 * "Test Area" will not reveal that a card breaks on a long name.
 */

/** Flat SVG placeholder so nothing depends on binary assets yet. */
function placeholderPhoto(id: string, tint: string, label: string): Photo {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='800' height='600' fill='%23${tint}'/><text x='400' y='310' font-family='sans-serif' font-size='34' fill='%23667085' text-anchor='middle'>${label}</text></svg>`;

  return {
    id,
    url: `data:image/svg+xml;utf8,${svg}`,
    width: 800,
    height: 600,
    blurhash: null,
    position: 0,
  };
}

export const bengaluru: City = {
  id: "city-blr",
  name: "Bengaluru",
  slug: "bengaluru",
  state: "Karnataka",
  activeListingCount: 12,
};

export const localities: Locality[] = [
  {
    id: "loc-koramangala",
    name: "Koramangala",
    slug: "koramangala",
    cityId: bengaluru.id,
    citySlug: bengaluru.slug,
    aliases: ["Koramangla", "Koramangala 5th Block"],
    activeListingCount: 3,
    medianRentPaise: 1_800_000,
  },
  {
    id: "loc-indiranagar",
    name: "Indiranagar",
    slug: "indiranagar",
    cityId: bengaluru.id,
    citySlug: bengaluru.slug,
    aliases: ["Indira Nagar", "Indranagar"],
    activeListingCount: 2,
    medianRentPaise: 2_200_000,
  },
  {
    id: "loc-hsr",
    name: "HSR Layout",
    slug: "hsr-layout",
    cityId: bengaluru.id,
    citySlug: bengaluru.slug,
    aliases: ["HSR", "H S R Layout"],
    activeListingCount: 3,
    medianRentPaise: 1_600_000,
  },
  {
    id: "loc-btm",
    name: "BTM Layout",
    slug: "btm-layout",
    cityId: bengaluru.id,
    citySlug: bengaluru.slug,
    aliases: ["BTM", "B T M Layout"],
    activeListingCount: 2,
    medianRentPaise: 1_100_000,
  },
  {
    id: "loc-whitefield",
    name: "Whitefield",
    slug: "whitefield",
    cityId: bengaluru.id,
    citySlug: bengaluru.slug,
    aliases: ["White Field"],
    activeListingCount: 2,
    medianRentPaise: 1_400_000,
  },
];

export const amenities: Amenity[] = [
  { id: "am-1", slug: "attachedbathroom", label: "Attached bathroom", category: "convenience" },
  { id: "am-2", slug: "geyser", label: "Geyser", category: "utilities" },
  { id: "am-3", slug: "powerbackup", label: "Power backup", category: "utilities" },
  { id: "am-4", slug: "water247", label: "24×7 water", category: "utilities" },
  { id: "am-5", slug: "wifi", label: "Wi-Fi", category: "convenience" },
  { id: "am-6", slug: "parkingtwowheeler", label: "Two-wheeler parking", category: "convenience" },
  { id: "am-7", slug: "lift", label: "Lift", category: "convenience" },
  { id: "am-8", slug: "securityguard", label: "Security guard", category: "safety" },
  { id: "am-9", slug: "cctv", label: "CCTV", category: "safety" },
  { id: "am-10", slug: "kitchenaccess", label: "Kitchen access", category: "convenience" },
  { id: "am-11", slug: "washingmachine", label: "Washing machine", category: "convenience" },
  { id: "am-12", slug: "fridge", label: "Fridge", category: "convenience" },
  { id: "am-13", slug: "ac", label: "Air conditioning", category: "convenience" },
  { id: "am-14", slug: "nonvegallowed", label: "Non-veg allowed", category: "rules" },
  { id: "am-15", slug: "petsallowed", label: "Pets allowed", category: "rules" },
  { id: "am-16", slug: "novisitorcurfew", label: "No gate-closing time", category: "rules" },
];

const listers: PublicUser[] = [
  {
    id: "user-1",
    name: "Priya Raghavan",
    avatarUrl: null,
    trustLevel: "trusted",
    verifications: ["phone", "governmentid", "ownership"],
    joinedAt: "2025-11-04T09:00:00Z",
    typicalReplyHours: 3,
    activeListingCount: 2,
  },
  {
    id: "user-2",
    name: "Arun Mehta",
    avatarUrl: null,
    trustLevel: "verified",
    verifications: ["phone", "governmentid"],
    joinedAt: "2026-04-18T09:00:00Z",
    typicalReplyHours: 11,
    activeListingCount: 1,
  },
  {
    id: "user-3",
    name: "Sana Qureshi",
    avatarUrl: null,
    trustLevel: "new",
    verifications: ["phone"],
    joinedAt: "2026-08-12T09:00:00Z",
    typicalReplyHours: null,
    activeListingCount: 1,
  },
];

interface Seed {
  slug: string;
  title: string;
  roomType: Listing["roomType"];
  postedBy: Listing["postedBy"];
  furnishing: Listing["furnishing"];
  rent: number;
  deposit: number;
  locality: string;
  lister: number;
  tint: string;
  billsIncluded: boolean;
  publishedDaysAgo: number;
}

const seeds: Seed[] = [
  { slug: "single-room-koramangala-5th-block", title: "Single room with attached bathroom, 5th Block", roomType: "singleroom", postedBy: "owner", furnishing: "semi", rent: 1_400_000, deposit: 2_800_000, locality: "koramangala", lister: 0, tint: "dbe7fe", billsIncluded: false, publishedDaysAgo: 2 },
  { slug: "1bhk-indiranagar-near-metro", title: "1BHK a five-minute walk from Indiranagar metro", roomType: "bhk1", postedBy: "owner", furnishing: "full", rent: 2_600_000, deposit: 5_200_000, locality: "indiranagar", lister: 0, tint: "e6f4ea", billsIncluded: true, publishedDaysAgo: 5 },
  { slug: "pg-bed-hsr-layout-sector-2", title: "PG bed for working women, Sector 2", roomType: "pgbed", postedBy: "owner", furnishing: "full", rent: 950_000, deposit: 950_000, locality: "hsr-layout", lister: 1, tint: "fff3e0", billsIncluded: true, publishedDaysAgo: 1 },
  { slug: "shared-room-btm-layout-2nd-stage", title: "Shared room in 3BHK, 2nd Stage", roomType: "sharedroom", postedBy: "tenant", furnishing: "semi", rent: 750_000, deposit: 1_500_000, locality: "btm-layout", lister: 2, tint: "f3e8ff", billsIncluded: false, publishedDaysAgo: 9 },
  { slug: "1rk-whitefield-itpl-road", title: "1RK on ITPL Road, ideal for a single professional", roomType: "rk1", postedBy: "owner", furnishing: "semi", rent: 1_300_000, deposit: 2_600_000, locality: "whitefield", lister: 1, tint: "e0f2fe", billsIncluded: false, publishedDaysAgo: 14 },
  { slug: "2bhk-hsr-layout-sector-7", title: "Spacious 2BHK with balcony, Sector 7", roomType: "bhk2", postedBy: "agent", furnishing: "unfurnished", rent: 3_400_000, deposit: 6_800_000, locality: "hsr-layout", lister: 1, tint: "fef3f2", billsIncluded: false, publishedDaysAgo: 3 },
  { slug: "single-room-koramangala-8th-block", title: "Independent room on terrace floor, 8th Block", roomType: "singleroom", postedBy: "owner", furnishing: "unfurnished", rent: 1_100_000, deposit: 1_100_000, locality: "koramangala", lister: 0, tint: "ecfdf3", billsIncluded: false, publishedDaysAgo: 21 },
  { slug: "pg-bed-koramangala-4th-block", title: "PG bed with meals included, 4th Block", roomType: "pgbed", postedBy: "owner", furnishing: "full", rent: 1_200_000, deposit: 1_200_000, locality: "koramangala", lister: 2, tint: "fffaeb", billsIncluded: true, publishedDaysAgo: 7 },
  { slug: "1bhk-btm-layout-quiet-lane", title: "1BHK on a quiet residential lane", roomType: "bhk1", postedBy: "tenant", furnishing: "semi", rent: 1_600_000, deposit: 3_200_000, locality: "btm-layout", lister: 2, tint: "eff8ff", billsIncluded: false, publishedDaysAgo: 4 },
  { slug: "hostel-bed-whitefield-students", title: "Hostel bed for students, walking distance to campus", roomType: "hostelbed", postedBy: "owner", furnishing: "full", rent: 700_000, deposit: 700_000, locality: "whitefield", lister: 1, tint: "f0fdf4", billsIncluded: true, publishedDaysAgo: 11 },
  { slug: "single-room-hsr-layout-sector-1", title: "Furnished single room, Sector 1", roomType: "singleroom", postedBy: "owner", furnishing: "full", rent: 1_500_000, deposit: 3_000_000, locality: "hsr-layout", lister: 0, tint: "faf5ff", billsIncluded: true, publishedDaysAgo: 6 },
  { slug: "1bhk-indiranagar-defence-colony", title: "1BHK in Defence Colony, first floor", roomType: "bhk1", postedBy: "owner", furnishing: "semi", rent: 2_100_000, deposit: 4_200_000, locality: "indiranagar", lister: 1, tint: "fef2f2", billsIncluded: false, publishedDaysAgo: 16 },
];

function daysAgo(days: number): string {
  const date = new Date("2026-08-16T09:00:00Z");
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function localityFor(slug: string): Locality {
  const found = localities.find((item) => item.slug === slug);
  if (!found) throw new Error(`unknown locality seed: ${slug}`);
  return found;
}

function listerFor(index: number): PublicUser {
  const found = listers[index];
  if (!found) throw new Error(`unknown lister seed: ${index}`);
  return found;
}

export const mockListings: Listing[] = seeds.map((seed, index) => {
  const locality = localityFor(seed.locality);
  const lister = listerFor(seed.lister);

  return {
    id: `listing-${index + 1}`,
    slug: seed.slug,
    status: "active",
    title: seed.title,
    description:
      "The room is on a quiet street with easy access to buses and autos. " +
      "Water supply is reliable and the area has plenty of shops and eateries " +
      "within walking distance. Visits are welcome on weekends; please message " +
      "before coming over.",
    roomType: seed.roomType,
    postedBy: seed.postedBy,
    furnishing: seed.furnishing,
    rentPaise: seed.rent,
    depositPaise: seed.deposit,
    maintenancePaise: seed.billsIncluded ? null : 150_000,
    billsIncluded: seed.billsIncluded,
    negotiable: index % 3 === 0,
    city: bengaluru,
    locality,
    approximateLat: 12.93 + index * 0.004,
    approximateLng: 77.62 + index * 0.004,
    areaSqft: 220 + index * 35,
    floor: (index % 4) + 1,
    totalFloors: 4,
    availableFrom: daysAgo(-((index % 5) * 7)),
    minStayMonths: seed.roomType === "pgbed" ? 3 : 11,
    preferredTenant:
      seed.roomType === "pgbed" ? ["bachelorfemale", "student"] : ["any"],
    amenities: amenities.slice(0, 5 + (index % 6)),
    photos: [
      placeholderPhoto(`photo-${index}-1`, seed.tint, "Room photo"),
      placeholderPhoto(`photo-${index}-2`, seed.tint, "Bathroom"),
      placeholderPhoto(`photo-${index}-3`, seed.tint, "Building"),
    ],
    lister,
    viewCount: 40 + index * 17,
    publishedAt: daysAgo(seed.publishedDaysAgo),
    expiresAt: daysAgo(seed.publishedDaysAgo - 30),
    createdAt: daysAgo(seed.publishedDaysAgo),
    updatedAt: daysAgo(seed.publishedDaysAgo),
  };
});

export function toSummary(listing: Listing): ListingSummary {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    roomType: listing.roomType,
    postedBy: listing.postedBy,
    furnishing: listing.furnishing,
    rentPaise: listing.rentPaise,
    depositPaise: listing.depositPaise,
    billsIncluded: listing.billsIncluded,
    cityName: listing.city.name,
    citySlug: listing.city.slug,
    localityName: listing.locality.name,
    localitySlug: listing.locality.slug,
    coverPhoto: listing.photos[0] ?? null,
    photoCount: listing.photos.length,
    availableFrom: listing.availableFrom,
    publishedAt: listing.publishedAt ?? listing.createdAt,
    listerVerified: listing.lister.verifications.includes("governmentid"),
    isSaved: false,
  };
}
