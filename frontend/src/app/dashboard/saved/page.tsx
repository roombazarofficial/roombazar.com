import Link from "next/link";
import { ListingGrid } from "@/components/listing/listinggrid";
import { EmptyState } from "@/components/ui/emptystate";
import { buttonStyles } from "@/components/ui/button";
import { mockListings, toSummary } from "@/lib/api/mockdata";
import { routes } from "@/lib/constants/routes";

export default function Page() {
  const saved = mockListings.slice(2, 5).map(toSummary);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Saved</h1>
        <Link
          href={routes.savedSearches}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          Saved searches
        </Link>
      </header>

      {saved.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Nothing saved yet"
          description="Tap the save icon on any room to keep it here while you compare."
          action={
            <Link href={routes.rooms} className={buttonStyles()}>
              Browse rooms
            </Link>
          }
        />
      ) : (
        <div className="mt-6">
          <ListingGrid listings={saved} />
        </div>
      )}
    </div>
  );
}
