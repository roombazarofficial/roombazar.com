import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "@/components/ui/skeleton";
import type { ListingSummary } from "@/types/listing";

/**
 * One column on a phone, scaling up from there. Most of this market browses
 * on a small screen, so the single-column case is the one that has to be
 * right rather than the one that gets tolerated.
 */
export function ListingGrid({ listings }: { listings: ListingSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} priority={index < 4} />
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}
