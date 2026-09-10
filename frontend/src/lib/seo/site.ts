/**
 * Single source of truth for site-level identity used across metadata,
 * structured data, the sitemap and the manifest. Changing the name or the
 * canonical origin should be one edit, not fifteen.
 */

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.roombazar.com"
).replace(/\/$/, "");

export const siteName = "RoomBazar";

export const siteDescription =
  "Find rooms, PGs and flats for rent directly from owners. No broker fees, no commission — message the person who actually has the room.";

export const siteEmail = "roombazar.official@gmail.com";

/**
 * Official social profile URLs — used in the footer, About page and
 * Organization structured data (sameAs). Add new profiles here; every
 * consumer picks them up automatically.
 */
export const socialProfiles = [
  { platform: "Instagram", url: "https://www.instagram.com/roombzr/" },
  {
    platform: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61593239100172",
  },
] as const;

/**
 * Founders — rendered on the About page and emitted as Person entities in
 * JSON-LD so that search engines connect the people to the organisation.
 */
export const founders = [
  { name: "Kushal Pandey", role: "Co-Founder", initials: "KP" },
  { name: "Satyam Pandey", role: "Co-Founder", initials: "SP" },
  { name: "Sachin Maurya", role: "Co-Founder", initials: "SM" },
] as const;

/** Absolute URL helper. Metadata and JSON-LD both require absolute URLs. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
