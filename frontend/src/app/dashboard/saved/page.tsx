import Link from "next/link";
import { SavedListingsView } from "@/components/saved/savedlistingsview";
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

      <SavedListingsView initialListings={savedListings} />
    </div>
  );
}
