import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";
import { getCities, getLocalities } from "@/lib/api/geography";
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

  const cities = await getCities();

  const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${siteUrl}/rooms/${city.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const localityRoutes: MetadataRoute.Sitemap = [];
  const listingRoutes: MetadataRoute.Sitemap = [];

  for (const city of cities) {
    const localities = await getLocalities(city.slug);

    for (const locality of localities) {
      localityRoutes.push({
        url: `${siteUrl}/rooms/${city.slug}/${locality.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    const page = await searchListings({ citySlug: city.slug, page: 1 });

    for (const listing of page.items) {
      listingRoutes.push({
        url: `${siteUrl}/room/${listing.slug}`,
        lastModified: new Date(listing.publishedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return [...staticRoutes, ...cityRoutes, ...localityRoutes, ...listingRoutes];
}
