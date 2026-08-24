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

  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: "memory",
      };
    }
    return config;
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
