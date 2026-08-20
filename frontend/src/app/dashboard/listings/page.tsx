import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { OwnerListingCard } from "@/components/dashboard/ownerlistingcard";
import { EmptyState } from "@/components/ui/emptystate";
import { getMyListings } from "@/lib/api/listings";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const listings = await getMyListings();

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            My listings
          </h1>

          <p className="mt-1 text-sm text-ink-muted">
            {listings.length} {listings.length === 1 ? "room" : "rooms"}, all time
          </p>

        </div>

        <Link href={routes.post} className={buttonStyles()}>
          Host a room
        </Link>

      </header>

      {listings.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No rooms listed yet"
          description="Posting is free and takes about three minutes."
          action={
            <Link href={routes.post} className={buttonStyles()}>
              Post your first room
            </Link>

          }
        />

      ) : (
        <div className="mt-6 space-y-3">
          {listings.map((listing) => (
            <OwnerListingCard key={listing.id} listing={listing} />

          ))}
        </div>

      )}
    </div>

  );
}
