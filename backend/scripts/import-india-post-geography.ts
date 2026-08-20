import "dotenv/config";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const sourceUrl =
  process.env.INDIA_POST_DATA_URL ??
  "https://raw.githubusercontent.com/dropdevrahul/pincodes-india/master/pincode.csv";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type Place = {
  name: string;
  slug: string;
  lat: number | null;
  lng: number | null;
};

type DistrictData = {
  stateName: string;
  name: string;
  places: Map<string, Place>;
  latTotal: number;
  lngTotal: number;
  coordinateCount: number;
};

async function main() {
  const response = await fetch(sourceUrl);
  if (!response.ok || !response.body) {
    throw new Error(`Could not download India Post data (${response.status})`);
  }

  const districts = new Map<string, DistrictData>();
  const lines = createInterface({
    input: Readable.fromWeb(response.body as never),
    crlfDelay: Infinity,
  });

  let first = true;
  for await (const line of lines) {
    if (first) {
      first = false;
      continue;
    }

    const columns = parseCsvLine(line);
    if (columns.length < 11) continue;

    const officeName = cleanOfficeName(columns[3] ?? "");
    const districtName = titleCase(columns[7] ?? "");
    const stateName = titleCase(columns[8] ?? "");
    if (!officeName || !districtName || !stateName) continue;

    const lat = coordinate(columns[9], 6, 38);
    const lng = coordinate(columns[10], 68, 98);
    const districtKey = `${normalise(stateName)}:${normalise(districtName)}`;
    const district = districts.get(districtKey) ?? {
      stateName,
      name: districtName,
      places: new Map<string, Place>(),
      latTotal: 0,
      lngTotal: 0,
      coordinateCount: 0,
    };

    if (lat !== null && lng !== null) {
      district.latTotal += lat;
      district.lngTotal += lng;
      district.coordinateCount += 1;
    }

    const placeSlug = slugify(officeName);
    if (placeSlug && !district.places.has(placeSlug)) {
      district.places.set(placeSlug, {
        name: officeName,
        slug: placeSlug,
        lat,
        lng,
      });
    }

    districts.set(districtKey, district);
  }

  const states = await prisma.state.findMany();
  const statesByName = new Map(
    states.map((state) => [normalise(state.name), state]),
  );

  let districtCount = 0;
  let placeCount = 0;

  const districtRows = [...districts.values()];
  for (let offset = 0; offset < districtRows.length; offset += 10) {
    const outcomes = await Promise.all(
      districtRows.slice(offset, offset + 10).map(async (district) => {
        const state = statesByName.get(normalise(district.stateName));
        if (!state) {
          console.warn(`Skipping unknown state: ${district.stateName}`);
          return { districts: 0, places: 0 };
        }

        const districtSlug = `${state.code.toLowerCase()}-${slugify(district.name)}`;
        const divisor = district.coordinateCount || 1;
        const districtLat = district.coordinateCount
          ? district.latTotal / divisor
          : 22.9734;
        const districtLng = district.coordinateCount
          ? district.lngTotal / divisor
          : 78.6569;
        const city = await prisma.city.upsert({
          where: { slug: districtSlug },
          update: {
            name: district.name,
            stateId: state.id,
            isActive: true,
            centroidLat: districtLat,
            centroidLng: districtLng,
          },
          create: {
            name: district.name,
            slug: districtSlug,
            stateId: state.id,
            isActive: true,
            centroidLat: districtLat,
            centroidLng: districtLng,
          },
        });

        const places = [...district.places.values()].map((place) => ({
          cityId: city.id,
          name: place.name,
          slug: place.slug,
          aliases: [],
          centroidLat: place.lat ?? districtLat,
          centroidLng: place.lng ?? districtLng,
        }));

        let insertedPlaces = 0;
        for (let index = 0; index < places.length; index += 500) {
          const result = await prisma.locality.createMany({
            data: places.slice(index, index + 500),
            skipDuplicates: true,
          });
          insertedPlaces += result.count;
        }

        await prisma.locality.updateMany({
          where: {
            cityId: city.id,
            OR: [
              { centroidLat: { lt: 6 } },
              { centroidLat: { gt: 38 } },
              { centroidLng: { lt: 68 } },
              { centroidLng: { gt: 98 } },
            ],
          },
          data: { centroidLat: districtLat, centroidLng: districtLng },
        });

        return { districts: 1, places: insertedPlaces };
      }),
    );

    districtCount += outcomes.reduce((sum, item) => sum + item.districts, 0);
    placeCount += outcomes.reduce((sum, item) => sum + item.places, 0);
  }

  console.log(`Districts imported: ${districtCount}`);
  console.log(`New postal places imported: ${placeCount}`);
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
}

function cleanOfficeName(value: string): string {
  return titleCase(value.replace(/\s+(B|S|H)\.O\.?$/i, "").trim());
}

function titleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function coordinate(
  value: string | undefined,
  minimum: number,
  maximum: number,
): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
