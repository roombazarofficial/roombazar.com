import type { MetadataRoute } from "next";

/**
 * Nothing here is ever indexed.
 *
 * Three layers say so — this file, an X-Robots-Tag header in next.config.ts,
 * and the same header again from middleware. That looks redundant, and is: a
 * console on a real hostname will eventually be found by something, and any one
 * of the three holding is enough.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
