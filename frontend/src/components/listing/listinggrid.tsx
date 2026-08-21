import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/classnames";
import type { ListingSummary } from "@/types/listing";

export function ListingGrid({
  listings,
  className,
}: {
  listings: ListingSummary[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id || listing.slug || `listing-${index}`}
          listing={listing}
          priority={index < 4}
        />
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
