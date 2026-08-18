export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteName = "RoomBazar";

export const siteDescription =
  "Find rooms, PGs and flats for rent directly from owners. No broker fees, no commission — message the person who actually has the room.";

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
