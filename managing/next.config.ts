import type { NextConfig } from "next";

/**
 * The management console.
 *
 * Deliberately spare compared with the public site: no image remote patterns
 * for listing photos beyond the one host, no SEO surface, no analytics. It
 * renders tables for a handful of operators.
 */
const config: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST ?? "images.roombazar.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          /*
            No referrer at all. An operator following a link out should not leak
            the console hostname, which is otherwise the one thing an attacker
            needs to know it exists.
          */
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default config;
