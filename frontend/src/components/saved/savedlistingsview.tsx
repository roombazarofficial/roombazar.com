"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListingGrid } from "@/components/listing/listinggrid";
import { EmptyState } from "@/components/ui/emptystate";
import { buttonStyles } from "@/components/ui/button";
import { useSavedStore } from "@/store/savedstore";
import { routes } from "@/lib/constants/routes";
import type { ListingSummary } from "@/types/listing";

export function SavedListingsView({
  initialListings = [],
}: {
  initialListings?: ListingSummary[];
}) {
  const [listings, setListings] = useState<ListingSummary[]>(initialListings);
  const [loading, setLoading] = useState(initialListings.length === 0);

  useEffect(() => {
    let mounted = true;
    useSavedStore
      .getState()
      .fetchSavedListings()
      .then((data) => {
        if (mounted && data) {
          setListings(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading && listings.length === 0) {
    return (
      <div className="mt-8 flex justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        title="Nothing saved yet"
        description="Tap the heart icon on any room to keep it in your wishlist while you compare."
        action={
          <Link href={routes.rooms} className={buttonStyles()}>
            Browse rooms
          </Link>
        }
      />
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <ListingGrid listings={listings} />
      <p className="mt-4 text-sm text-ink-muted">
        {listings.length} saved {listings.length === 1 ? "room" : "rooms"}.
      </p>
    </div>
  );
}
