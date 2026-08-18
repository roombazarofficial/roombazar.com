import { computeRankScore, isSuspiciouslyCheap } from "./ranking";
import type { Listing } from "src/domain/listing.entity";

function listing(overrides: Partial<Listing> = {}): Listing {
  const now = new Date("2026-08-17T00:00:00.000Z").toISOString();

  return {
    id: "listing-1",
    slug: "a-room",
    ownerId: "user-1",
    status: "active",
    title: "A room",
    description: "x".repeat(200),
    roomType: "singleroom",
    postedBy: "owner",
    furnishing: "semi",
    rentPaise: 1_400_000,
    depositPaise: 2_800_000,
    maintenancePaise: null,
    billsIncluded: true,
    negotiable: false,
    cityId: "city-blr",
    localityId: "loc-koramangala",
    addressLine: null,
    lat: null,
    lng: null,
    areaSqft: 240,
    floor: 2,
    totalFloors: 4,
    availableFrom: "2026-09-01",
    minStayMonths: 11,
    preferredTenant: ["any"],
    amenitySlugs: ["a", "b", "c", "d", "e", "f"],
    photos: [1, 2, 3, 4, 5].map((n) => ({
      id: `p${n}`,
      objectKey: `k${n}`,
      secureUrl: `https://res.cloudinary.com/demo/image/upload/k${n}.jpg`,
      kind: "image" as const,
      format: "jpg",
      contentType: "image/jpg",
      sizeBytes: 120_000,
      width: 800,
      height: 600,
      durationSeconds: null,
      blurhash: null,
      position: n - 1,
      moderationState: "ok" as const,
    })),
    viewCount: 0,
    rankScore: 0,
    publishedAt: now,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

const NOW = new Date("2026-08-17T00:00:00.000Z");

describe("computeRankScore", () => {
  it("does not use rent as an input", () => {
    const cheap = computeRankScore(listing({ rentPaise: 100_000 }), "verified", NOW);
    const dear = computeRankScore(listing({ rentPaise: 9_000_000 }), "verified", NOW);

    expect(cheap).toBeCloseTo(dear, 10);
  });

  it("ranks a fresh listing above an old one", () => {
    const fresh = computeRankScore(listing(), "verified", NOW);
    const old = computeRankScore(
      listing({ publishedAt: "2026-07-25T00:00:00.000Z" }),
      "verified",
      NOW,
    );

    expect(fresh).toBeGreaterThan(old);
  });

  it("ranks a complete listing above a thin one", () => {
    const complete = computeRankScore(listing(), "verified", NOW);
    const thin = computeRankScore(
      listing({
        description: "",
        amenitySlugs: [],
        areaSqft: null,
        floor: null,
        preferredTenant: [],
        billsIncluded: false,
        photos: [listing().photos[0]!],
      }),
      "verified",
      NOW,
    );

    expect(complete).toBeGreaterThan(thin);
  });

  it("weights a trusted lister above a brand new one", () => {
    const trusted = computeRankScore(listing(), "trusted", NOW);
    const fresh = computeRankScore(listing(), "new", NOW);

    expect(trusted).toBeGreaterThan(fresh);
  });

  it("gives a restricted account no ranking weight", () => {
    const restricted = computeRankScore(listing(), "restricted", NOW);
    const normal = computeRankScore(listing(), "new", NOW);

    expect(restricted).toBeLessThan(normal);
  });

  it("ignores rejected photos when scoring completeness", () => {
    const rejected = listing({
      photos: listing().photos.map((photo) => ({
        ...photo,
        moderationState: "rejected" as const,
      })),
    });

    expect(computeRankScore(rejected, "verified", NOW)).toBeLessThan(
      computeRankScore(listing(), "verified", NOW),
    );
  });

  it("never returns a negative score, even long past expiry", () => {
    const ancient = computeRankScore(
      listing({ publishedAt: "2025-01-01T00:00:00.000Z" }),
      "restricted",
      NOW,
    );

    expect(ancient).toBeGreaterThanOrEqual(0);
  });
});

describe("isSuspiciouslyCheap", () => {
  it("flags rent far below the locality median", () => {
    expect(isSuspiciouslyCheap(500_000, 1_800_000)).toBe(true);
  });

  it("does not flag a merely cheap room", () => {
    expect(isSuspiciouslyCheap(1_200_000, 1_800_000)).toBe(false);
  });

  it("cannot flag anything without a median to compare against", () => {
    expect(isSuspiciouslyCheap(100_000, null)).toBe(false);
    expect(isSuspiciouslyCheap(100_000, 0)).toBe(false);
  });
});
