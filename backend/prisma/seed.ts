import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/**
 * Reference data the application cannot function without.
 *
 * A listing cannot be created without a locality to attach it to, and search
 * cannot filter without the amenity and type lookups — so this is not sample
 * data, it is part of the schema being usable at all.
 *
 * Every write is an upsert keyed on a natural unique column, so running this
 * repeatedly is safe and it can be used to add a new city later without
 * touching what already exists.
 *
 * The values deliberately match frontend/src/lib/api/mockdata.ts, so the
 * frontend behaves identically before and after it starts reading real data.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — nothing to seed against.");
}

const prisma = new PrismaClient();

/** Org-scoped membership roles. Distinct from the platform role on User. */
const roles = [
  { code: "owner", name: "Owner" },
  { code: "manager", name: "Manager" },
  { code: "staff", name: "Staff" },
];

const propertyTypes = [
  { code: "independenthouse", name: "Independent house" },
  { code: "apartment", name: "Apartment" },
  { code: "villa", name: "Villa" },
  { code: "pg", name: "PG" },
  { code: "hostel", name: "Hostel" },
  { code: "colivingspace", name: "Co-living space" },
];

const roomTypes = [
  { code: "single", name: "Single occupancy" },
  { code: "double", name: "Double sharing" },
  { code: "triple", name: "Triple sharing" },
  { code: "quadruple", name: "Four sharing" },
  { code: "studio", name: "Studio" },
];

const bedTypes = [
  { code: "single", name: "Single bed" },
  { code: "bunk", name: "Bunk bed" },
  { code: "double", name: "Double bed" },
];

/**
 * Curated per city, with the alternate spellings that must resolve to the same
 * row. Without the aliases, "Indiranagar" and "Indira Nagar" become different
 * places and both sides of the market stop finding each other.
 */
const bengaluruLocalities = [
  {
    name: "Koramangala",
    slug: "koramangala",
    aliases: ["Koramangla", "Kormangala", "Koramangala 5th Block", "Koramangala 8th Block"],
    centroidLat: 12.9352,
    centroidLng: 77.6245,
  },
  {
    name: "Indiranagar",
    slug: "indiranagar",
    aliases: ["Indira Nagar", "Indranagar", "Indira Nagara", "Indiranagar 2nd Stage"],
    centroidLat: 12.9784,
    centroidLng: 77.6408,
  },
  {
    name: "HSR Layout",
    slug: "hsr-layout",
    aliases: ["HSR", "H S R Layout", "HSR Sector 1", "HSR Sector 2", "HSR Sector 7"],
    centroidLat: 12.9121,
    centroidLng: 77.6446,
  },
  {
    name: "BTM Layout",
    slug: "btm-layout",
    aliases: ["BTM", "B T M Layout", "BTM 1st Stage", "BTM 2nd Stage"],
    centroidLat: 12.9166,
    centroidLng: 77.6101,
  },
  {
    name: "Whitefield",
    slug: "whitefield",
    aliases: ["White Field", "Whitefiled", "ITPL", "Whitefield Main Road"],
    centroidLat: 12.9698,
    centroidLng: 77.75,
  },
  {
    name: "Marathahalli",
    slug: "marathahalli",
    aliases: ["Marathalli", "Marathahalli Bridge"],
    centroidLat: 12.9591,
    centroidLng: 77.6974,
  },
  {
    name: "Jayanagar",
    slug: "jayanagar",
    aliases: ["Jaya Nagar", "Jayanagar 4th Block"],
    centroidLat: 12.9299,
    centroidLng: 77.5826,
  },
  {
    name: "Electronic City",
    slug: "electronic-city",
    aliases: ["Electronics City", "E City", "Ecity"],
    centroidLat: 12.8452,
    centroidLng: 77.6602,
  },
  {
    name: "Bellandur",
    slug: "bellandur",
    aliases: ["Belandur", "Bellandur Gate"],
    centroidLat: 12.9257,
    centroidLng: 77.6764,
  },
  {
    name: "Hebbal",
    slug: "hebbal",
    aliases: ["Hebbala", "Hebbal Kempapura"],
    centroidLat: 13.0358,
    centroidLng: 77.597,
  },
];

/** Amenity slugs are stable identifiers; the labels are display text. */
const amenities = [
  { slug: "attachedbathroom", name: "Attached bathroom", category: "convenience" },
  { slug: "westerntoilet", name: "Western toilet", category: "convenience" },
  { slug: "geyser", name: "Geyser", category: "utilities" },
  { slug: "powerbackup", name: "Power backup", category: "utilities" },
  { slug: "water247", name: "24x7 water", category: "utilities" },
  { slug: "borewell", name: "Borewell water", category: "utilities" },
  { slug: "wifi", name: "Wi-Fi", category: "convenience" },
  { slug: "parkingtwowheeler", name: "Two-wheeler parking", category: "convenience" },
  { slug: "parkingcar", name: "Car parking", category: "convenience" },
  { slug: "lift", name: "Lift", category: "convenience" },
  { slug: "kitchenaccess", name: "Kitchen access", category: "convenience" },
  { slug: "washingmachine", name: "Washing machine", category: "convenience" },
  { slug: "fridge", name: "Fridge", category: "convenience" },
  { slug: "ac", name: "Air conditioning", category: "convenience" },
  { slug: "cotmattress", name: "Cot and mattress", category: "convenience" },
  { slug: "mealsincluded", name: "Meals included", category: "convenience" },
  { slug: "securityguard", name: "Security guard", category: "safety" },
  { slug: "cctv", name: "CCTV", category: "safety" },
  { slug: "gatedsociety", name: "Gated society", category: "safety" },
  { slug: "nonvegallowed", name: "Non-veg allowed", category: "rules" },
  { slug: "petsallowed", name: "Pets allowed", category: "rules" },
  { slug: "visitorsallowed", name: "Visitors allowed", category: "rules" },
  { slug: "novisitorcurfew", name: "No gate-closing time", category: "rules" },
  { slug: "smokingallowed", name: "Smoking allowed", category: "rules" },
] as const;

async function main(): Promise<void> {
  console.log("seeding reference data\n");

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name },
      create: role,
    });
  }
  console.log(`  roles            ${roles.length}`);

  for (const type of propertyTypes) {
    await prisma.propertyType.upsert({
      where: { code: type.code },
      update: { name: type.name },
      create: type,
    });
  }
  console.log(`  property types   ${propertyTypes.length}`);

  for (const type of roomTypes) {
    await prisma.roomType.upsert({
      where: { code: type.code },
      update: { name: type.name },
      create: type,
    });
  }
  console.log(`  room types       ${roomTypes.length}`);

  for (const type of bedTypes) {
    await prisma.bedType.upsert({
      where: { code: type.code },
      update: { name: type.name },
      create: type,
    });
  }
  console.log(`  bed types        ${bedTypes.length}`);

  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: { name: amenity.name, category: amenity.category },
      create: { ...amenity },
    });
  }
  console.log(`  amenities        ${amenities.length}`);

  const statesData = [
    { code: "KA", name: "Karnataka" },
    { code: "UP", name: "Uttar Pradesh" },
    { code: "DL", name: "Delhi" },
    { code: "HR", name: "Haryana" },
    { code: "MH", name: "Maharashtra" },
    { code: "TS", name: "Telangana" },
    { code: "TN", name: "Tamil Nadu" },
    { code: "WB", name: "West Bengal" },
    { code: "GJ", name: "Gujarat" },
    { code: "RJ", name: "Rajasthan" },
  ];

  const stateMap = new Map<string, string>();
  for (const st of statesData) {
    const s = await prisma.state.upsert({
      where: { code: st.code },
      update: { name: st.name },
      create: { name: st.name, code: st.code },
    });
    stateMap.set(st.code, s.id);
  }

  const citiesData = [
    { slug: "bengaluru", name: "Bengaluru", stateCode: "KA", centroidLat: 12.9716, centroidLng: 77.5946 },
    { slug: "gautam-buddha-nagar", name: "Gautam Buddha Nagar (Noida)", stateCode: "UP", centroidLat: 28.5355, centroidLng: 77.391 },
    { slug: "ghaziabad", name: "Ghaziabad", stateCode: "UP", centroidLat: 28.6692, centroidLng: 77.4538 },
    { slug: "lucknow", name: "Lucknow", stateCode: "UP", centroidLat: 26.8467, centroidLng: 80.9462 },
    { slug: "south-delhi", name: "South Delhi", stateCode: "DL", centroidLat: 28.4817, centroidLng: 77.1873 },
    { slug: "new-delhi", name: "New Delhi", stateCode: "DL", centroidLat: 28.6139, centroidLng: 77.209 },
    { slug: "gurugram", name: "Gurugram (Gurgaon)", stateCode: "HR", centroidLat: 28.4595, centroidLng: 77.0266 },
    { slug: "mumbai-suburban", name: "Mumbai Suburban", stateCode: "MH", centroidLat: 19.076, centroidLng: 72.8777 },
    { slug: "pune", name: "Pune", stateCode: "MH", centroidLat: 18.5204, centroidLng: 73.8567 },
    { slug: "hyderabad", name: "Hyderabad", stateCode: "TS", centroidLat: 17.385, centroidLng: 78.4867 },
  ];

  const cityMap = new Map<string, string>();
  for (const c of citiesData) {
    const stateId = stateMap.get(c.stateCode) ?? stateMap.get("KA")!;
    const city = await prisma.city.upsert({
      where: { slug: c.slug },
      update: { name: c.name, isActive: true },
      create: {
        stateId,
        name: c.name,
        slug: c.slug,
        isActive: true,
        centroidLat: c.centroidLat,
        centroidLng: c.centroidLng,
      },
    });
    cityMap.set(c.slug, city.id);
  }

  // Localities for Noida
  const noidaCityId = cityMap.get("gautam-buddha-nagar");
  if (noidaCityId) {
    const noidaLocs = [
      { name: "Noida Sector 62", slug: "noida-sector-62", aliases: ["Sector 62", "Sec 62 Noida"], centroidLat: 28.628, centroidLng: 77.3649 },
      { name: "Noida Sector 18", slug: "noida-sector-18", aliases: ["Sector 18", "Atta Market"], centroidLat: 28.5708, centroidLng: 77.3271 },
      { name: "Noida Sector 15", slug: "noida-sector-15", aliases: ["Sector 15"], centroidLat: 28.5833, centroidLng: 77.3117 },
      { name: "Noida Sector 50", slug: "noida-sector-50", aliases: ["Sector 50"], centroidLat: 28.5714, centroidLng: 77.3694 },
      { name: "Noida Sector 76", slug: "noida-sector-76", aliases: ["Sector 76"], centroidLat: 28.5667, centroidLng: 77.3833 },
      { name: "Greater Noida West", slug: "greater-noida-west", aliases: ["Noida Extension", "Gaur City"], centroidLat: 28.5983, centroidLng: 77.4333 },
    ];

    for (const loc of noidaLocs) {
      await prisma.locality.upsert({
        where: { cityId_slug: { cityId: noidaCityId, slug: loc.slug } },
        update: { name: loc.name, aliases: loc.aliases },
        create: { ...loc, cityId: noidaCityId },
      });
    }
  }

  const bengaluruId = cityMap.get("bengaluru")!;
  for (const locality of bengaluruLocalities) {
    await prisma.locality.upsert({
      where: { cityId_slug: { cityId: bengaluruId, slug: locality.slug } },
      update: {
        name: locality.name,
        aliases: locality.aliases,
        centroidLat: locality.centroidLat,
        centroidLng: locality.centroidLng,
      },
      create: { ...locality, cityId: bengaluruId },
    });
  }

  const aliasCount = bengaluruLocalities.reduce(
    (sum, locality) => sum + locality.aliases.length,
    0,
  );
  console.log(
    `  localities       ${bengaluruLocalities.length} (${aliasCount} aliases)`,
  );

  console.log("\nreference data seeded");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("\nseed failed:", error);
    await prisma.$disconnect();
    // Non-zero exit so CI and `prisma migrate reset` treat a failed seed as a
    // failure rather than carrying on with a half-populated database.
    process.exit(1);
  });
