import Link from "next/link";
import { ListingGrid } from "@/components/listing/listinggrid";
import { EmptyState } from "@/components/ui/emptystate";
import { buttonStyles } from "@/components/ui/button";
import { getSavedListings } from "@/lib/api/saved";
import { routes } from "@/lib/constants/routes";
import type { ListingSummary } from "@/types/listing";

export default async function Page() {
  const rawSavedListings = await getSavedListings();
  const savedListings: ListingSummary[] = Array.isArray(rawSavedListings)
    ? rawSavedListings.filter(
        (item): item is ListingSummary =>
          Boolean(item && typeof item === "object" && item.id && item.title),
      )
    : [];

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Wishlist / Saved Rooms</h1>

        <Link
          href={routes.savedSearches}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          Saved searches
        </Link>
      </header>

      {savedListings.length === 0 ? (
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
      ) : (
        <div className="mt-6 space-y-6">
          <ListingGrid listings={savedListings} />

          <p className="mt-4 text-sm text-ink-muted">
            {savedListings.length} saved{" "}
            {savedListings.length === 1 ? "room" : "rooms"}.
          </p>
        </div>
      )}
    </div>
  );
}
