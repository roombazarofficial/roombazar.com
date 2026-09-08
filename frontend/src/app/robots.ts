import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    "/dashboard/",
    "/dashboard",
    "/admin/",
    "/admin",
    "/post/",
    "/post",
    "/login",
    "/register",
    "/signin",
    "/verify",
    "/onboarding",
    "/forgot-password",
    "/reset-password",
    "/u/",
    "/api/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "GPTBot",
          "Googlebot",
          "Bingbot",
          "PerplexityBot",
          "ClaudeBot",
          "Applebot",
        ],
        allow: [
          "/",
          "/room/",
          "/rooms/",
          "/about",
          "/safety",
          "/help",
          "/contact",
          "/terms",
          "/privacy",
          "/llms.txt",
          "/sitemap.xml",
        ],
        disallow: privatePaths,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
