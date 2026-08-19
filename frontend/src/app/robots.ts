import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private surfaces. Listing pages that are taken or expired stay
      // crawlable but carry a noindex tag on the page itself.
      disallow: ["/dashboard", "/admin", "/post", "/login", "/verify"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
