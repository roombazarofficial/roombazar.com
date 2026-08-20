import { fuzzCoordinates } from "./geo";

const LAT = 12.9352;
const LNG = 77.6245;

function metresBetween(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6_371_000;

  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

describe("fuzzCoordinates", () => {
  it("passes through a listing with no coordinates", () => {
    expect(fuzzCoordinates(null, null, "listing-1")).toEqual({
      lat: null,
      lng: null,
    });
  });

  it("never returns the exact position", () => {
    const fuzzed = fuzzCoordinates(LAT, LNG, "listing-1");

    expect(fuzzed.lat).not.toBe(LAT);
    expect(fuzzed.lng).not.toBe(LNG);
  });

  it("is deterministic for a given listing", () => {
    const first = fuzzCoordinates(LAT, LNG, "listing-1");
    const second = fuzzCoordinates(LAT, LNG, "listing-1");

    expect(first).toEqual(second);
  });

  it("offsets different listings differently", () => {
    const a = fuzzCoordinates(LAT, LNG, "listing-1");
    const b = fuzzCoordinates(LAT, LNG, "listing-2");

    expect(a).not.toEqual(b);
  });

  it("stays within a few hundred metres so the area is still useful", () => {
    for (let i = 0; i < 200; i += 1) {
      const fuzzed = fuzzCoordinates(LAT, LNG, `listing-${i}`);
      const distance = metresBetween(LAT, LNG, fuzzed.lat!, fuzzed.lng!);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(600);
    }
  });

  it("rounds hard enough that precision cannot be recovered", () => {
    const fuzzed = fuzzCoordinates(LAT, LNG, "listing-1");

    const decimals = (value: number) =>
      (value.toString().split(".")[1] ?? "").length;

    expect(decimals(fuzzed.lat!)).toBeLessThanOrEqual(3);
    expect(decimals(fuzzed.lng!)).toBeLessThanOrEqual(3);
  });

  it("works in both hemispheres", () => {
    const south = fuzzCoordinates(-33.8688, 151.2093, "listing-1");

    expect(Number.isFinite(south.lat)).toBe(true);
    expect(Number.isFinite(south.lng)).toBe(true);
  });
});
