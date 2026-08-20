import type { MetadataRoute } from "next";
import { siteName, siteDescription } from "@/lib/seo/site";

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
      {
        src: "/logo/roombazaricon192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/roombazaricon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/roombazaricon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
