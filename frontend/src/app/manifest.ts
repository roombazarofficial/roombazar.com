import type { MetadataRoute } from "next";
import { siteName, siteDescription } from "@/lib/seo/site";

/**
 * Makes the site installable to a phone home screen. For a market where a lot
 * of people would rather not spend storage on another app, an installable web
 * app is the cheapest route to a returning user.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — rooms for rent`,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2551eb",
    orientation: "portrait",
    categories: ["lifestyle", "travel"],
    lang: "en-IN",
    icons: [
      { src: "/logo/roombazar-icon.png", sizes: "192x192", type: "image/png" },
      { src: "/logo/roombazar-icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
