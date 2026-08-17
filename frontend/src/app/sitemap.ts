import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";
import { bengaluru, localities, mockListings } from "@/lib/api/mockdata";

/**
 * Locality pages are the main organic entry point, so they belong here
 * alongside listings rather than only the static marketing pages.
 *
 * Only ACTIVE listings are included. Taken and expired listings keep their
 * URLs and inbound links but carry a noindex tag, and submitting a URL we are
 * simultaneously asking not to index wastes crawl budget.
 *
 * Past roughly 50k URLs this needs splitting into a sitemap index — see
 * docs/02-architecture.md.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
      { url: `${siteUrl}/rooms`, changeFrequency: "daily", priority: 0.9 },
      { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${siteUrl}/safety`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${siteUrl}/help`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
      { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ] satisfies MetadataRoute.Sitemap
  ).map((entry) => ({ ...entry, lastModified: now }));

  const cityRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/rooms/${bengaluru.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const localityRoutes: MetadataRoute.Sitemap = localities.map((locality) => ({
    url: `${siteUrl}/rooms/${locality.citySlug}/${locality.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    // Localities with real supply are worth crawling more often than empty
    // ones, and priority is the only lever the protocol gives us.
    priority: locality.activeListingCount > 2 ? 0.8 : 0.6,
  }));

  const listingRoutes: MetadataRoute.Sitemap = mockListings
    .filter((listing) => listing.status === "active")
    .map((listing) => ({
      url: `${siteUrl}/room/${listing.slug}`,
      lastModified: new Date(listing.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...localityRoutes,
    ...listingRoutes,
  ];
}
