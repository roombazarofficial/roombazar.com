import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";
import { searchListings } from "@/lib/api/listings";

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

  const page = await searchListings({ sort: "newest", page: 1 });
  const cityRoutes: MetadataRoute.Sitemap = Array.from(
    new Map(page.items.map((listing) => [listing.citySlug, listing])).values(),
  ).map((listing) => ({
    url: `${siteUrl}/rooms/${listing.citySlug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));
  const localityRoutes: MetadataRoute.Sitemap = Array.from(
    new Map(
      page.items.map((listing) => [
        `${listing.citySlug}/${listing.localitySlug}`,
        listing,
      ]),
    ).values(),
  ).map((listing) => ({
    url: `${siteUrl}/rooms/${listing.citySlug}/${listing.localitySlug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));
  const listingRoutes: MetadataRoute.Sitemap = page.items.map((listing) => ({
    url: `${siteUrl}/room/${listing.slug}`,
    lastModified: new Date(listing.publishedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...cityRoutes, ...localityRoutes, ...listingRoutes];
}
