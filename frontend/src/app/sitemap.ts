import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";
import { getSitemapEntries } from "@/lib/api/listings";

/**
 * The sitemap is built entirely from real, active listings. City and locality
 * URLs are derived from those listings, so a location page only appears once it
 * has genuine inventory behind it — never as a thin, empty page.
 *
 * Excluded by construction: auth pages, dashboard, admin, the post wizard, and
 * any listing that is not `active` (expired / taken / suspended / draft).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${siteUrl}/rooms`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${siteUrl}/safety`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${siteUrl}/help`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
  ];

  const entries = await getSitemapEntries().catch(() => []);

  // Newest listing timestamp per city / locality, so `lastmod` on those pages is
  // a real signal rather than "now" on every crawl.
  const cityLastMod = new Map<string, number>();
  const localityLastMod = new Map<string, number>();

  const listingRoutes: MetadataRoute.Sitemap = [];

  for (const entry of entries) {
    if (!entry.slug || !entry.citySlug || !entry.localitySlug) continue;

    const stamp = new Date(entry.publishedAt ?? entry.updatedAt).getTime();
    const locKey = `${entry.citySlug}/${entry.localitySlug}`;

    cityLastMod.set(entry.citySlug, Math.max(cityLastMod.get(entry.citySlug) ?? 0, stamp));
    localityLastMod.set(locKey, Math.max(localityLastMod.get(locKey) ?? 0, stamp));

    listingRoutes.push({
      url: `${siteUrl}/room/${entry.slug}`,
      lastModified: new Date(stamp),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const cityRoutes: MetadataRoute.Sitemap = Array.from(cityLastMod.entries()).map(
    ([citySlug, stamp]) => ({
      url: `${siteUrl}/rooms/${citySlug}`,
      lastModified: new Date(stamp),
      changeFrequency: "daily",
      priority: 0.8,
    }),
  );

  const localityRoutes: MetadataRoute.Sitemap = Array.from(localityLastMod.entries()).map(
    ([locKey, stamp]) => ({
      url: `${siteUrl}/rooms/${locKey}`,
      lastModified: new Date(stamp),
      changeFrequency: "daily",
      priority: 0.75,
    }),
  );

  return [...staticRoutes, ...cityRoutes, ...localityRoutes, ...listingRoutes];
}
