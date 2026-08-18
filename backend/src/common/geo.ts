const FUZZ_METRES = 300;

export function fuzzCoordinates(
  lat: number | null,
  lng: number | null,
  seed: string,
): { lat: number | null; lng: number | null } {
  if (lat === null || lng === null) return { lat: null, lng: null };

  const hash = hashString(seed);

  const angle = (hash % 360) * (Math.PI / 180);
  const radius = FUZZ_METRES * (0.4 + ((hash >> 9) % 60) / 100);

  const metresPerDegreeLat = 111_320;
  const metresPerDegreeLng = 111_320 * Math.cos((lat * Math.PI) / 180);

  return {
    lat: round(lat + (radius * Math.sin(angle)) / metresPerDegreeLat),
    lng: round(lng + (radius * Math.cos(angle)) / metresPerDegreeLng),
  };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}
