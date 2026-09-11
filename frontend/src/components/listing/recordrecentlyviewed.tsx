"use client";

import { useEffect } from "react";
import { recordRecentlyViewed } from "@/lib/recentlyviewed";
import type { Listing } from "@/types/listing";

/** Invisible — just records this visit into the viewer's local history. */
export function RecordRecentlyViewed({ listing }: { listing: Listing }) {
  useEffect(() => {
    recordRecentlyViewed({
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      coverPhotoUrl: listing.photos[0]?.url ?? null,
      rentPaise: listing.rentPaise,
      cityName: listing.city.name,
      localityName: listing.locality.name,
    });
  }, [listing]);

  return null;
}
