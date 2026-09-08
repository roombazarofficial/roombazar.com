import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,

  images: {
    // Listing photos are served from R2 through a public image domain.
    // Set the host in .env and keep this list as narrow as possible.
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST ?? "images.roombazar.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Canonical host is www.roombazar.com. Anything hitting the bare apex is
  // 301'd so search engines only ever index one origin. Hosting-level domain
  // config should do this too; this is the in-app safety net.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "roombazar.com" }],
        destination: "https://www.roombazar.com/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default config;
