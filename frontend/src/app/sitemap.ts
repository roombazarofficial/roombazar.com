import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";
import { searchListings } from "@/lib/api/listings";
import { getCities } from "@/lib/api/geography";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static authority and informational pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily" as const, priority: 1.0, lastModified: now },
    { url: `${siteUrl}/rooms`, changeFrequency: "daily" as const, priority: 0.9, lastModified: now },
    { url: `${siteUrl}/about`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${siteUrl}/safety`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${siteUrl}/help`, changeFrequency: "monthly" as const, priority: 0.6, lastModified: now },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly" as const, priority: 0.4, lastModified: now },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly" as const, priority: 0.3, lastModified: now },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly" as const, priority: 0.3, lastModified: now },
    { url: `${siteUrl}/llms.txt`, changeFrequency: "weekly" as const, priority: 0.5, lastModified: now },
  ];

  // 2. Active published room listings
  const listingsPage = await searchListings({ sort: "newest", page: 1 }).catch(() => ({ items: [] }));
  const items = listingsPage?.items ?? [];

  const listingRoutes: MetadataRoute.Sitemap = items.map((listing) => ({
    url: `${siteUrl}/room/${listing.slug}`,
    lastModified: listing.publishedAt ? new Date(listing.publishedAt) : now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // 3. Known cities with listings or geography database
  const cities = await getCities().catch(() => []);
  const citySlugs = new Set<string>([
    ...cities.map((c) => c.slug),
    ...items.map((i) => i.citySlug),
  ]);

  const cityRoutes: MetadataRoute.Sitemap = Array.from(citySlugs).map((citySlug) => ({
    url: `${siteUrl}/rooms/${citySlug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // 4. Locality routes with active inventory
  const localityKeyMap = new Map<string, { citySlug: string; localitySlug: string }>();
  for (const item of items) {
    if (item.citySlug && item.localitySlug) {
      localityKeyMap.set(`${item.citySlug}/${item.localitySlug}`, {
        citySlug: item.citySlug,
        localitySlug: item.localitySlug,
      });
    }
  }

  const localityRoutes: MetadataRoute.Sitemap = Array.from(localityKeyMap.values()).map(
    ({ citySlug, localitySlug }) => ({
      url: `${siteUrl}/rooms/${citySlug}/${localitySlug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...cityRoutes, ...localityRoutes, ...listingRoutes];
}
