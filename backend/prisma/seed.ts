import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
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

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

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

  const karnataka = await prisma.state.upsert({
    where: { code: "KA" },
    update: { name: "Karnataka" },
    create: { name: "Karnataka", code: "KA" },
  });

  /*
    Only Bengaluru is active. Adding a city is not a matter of inserting a row:
    it needs a curated locality list with aliases first, or search in that city
    fragments from day one. The inactive flag is what stops a half-seeded city
    appearing in the picker.
  */
  const bengaluru = await prisma.city.upsert({
    where: { slug: "bengaluru" },
    update: { isActive: true },
    create: {
      stateId: karnataka.id,
      name: "Bengaluru",
      slug: "bengaluru",
      isActive: true,
      centroidLat: 12.9716,
      centroidLng: 77.5946,
    },
  });
  console.log(`  states           1`);
  console.log(`  cities           1 (bengaluru, active)`);

  for (const locality of bengaluruLocalities) {
    await prisma.locality.upsert({
      where: { cityId_slug: { cityId: bengaluru.id, slug: locality.slug } },
      update: {
        name: locality.name,
        aliases: locality.aliases,
        centroidLat: locality.centroidLat,
        centroidLng: locality.centroidLng,
      },
      create: { ...locality, cityId: bengaluru.id },
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
