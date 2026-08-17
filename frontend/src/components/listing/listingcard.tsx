import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PostedByBadge } from "./postedbybadge";
import { FreshnessLabel } from "./freshnesslabel";
import { SaveListingButton } from "./savelistingbutton";
import { formatRupees } from "@/lib/format/rupees";
import { roomTypeLabels } from "@/lib/constants/roomtypes";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";
import type { ListingSummary } from "@/types/listing";

/**
 * The most-repeated element in the product. A seeker scanning a results page
 * decides from this card alone, so it carries exactly the four things that
 * drive that decision: rent, where, what, and who posted it.
 *
 * Deliberately not on the card: description text and amenity lists. Both
 * lengthen the card without changing whether someone taps it.
 */
export function ListingCard({
  listing,
  priority = false,
  className,
}: {
  listing: ListingSummary;
  /** Set on the first few cards so their images are not lazy-loaded. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-card border border-line bg-surface",
        "transition-shadow hover:shadow-raised",
        className,
      )}
    >
      <div className="relative aspect-4/3 bg-surface-sunken">
        {listing.coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverPhoto.url}
            alt=""
            loading={priority ? "eager" : "lazy"}
            width={listing.coverPhoto.width}
            height={listing.coverPhoto.height}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-ink-subtle">
            No photo
          </div>
        )}

        {listing.photoCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-2xs font-medium text-ink-inverse">
            {listing.photoCount} photos
          </span>
        )}

        <SaveListingButton
          listingId={listing.id}
          initialSaved={listing.isSaved}
          className="absolute right-2 top-2"
        />
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-semibold text-ink">
            {formatRupees(listing.rentPaise)}
            <span className="text-sm font-normal text-ink-muted">/month</span>
          </p>

          {listing.billsIncluded && (
            <Badge tone="info">Bills included</Badge>
          )}
        </div>

        {/*
          The whole card is clickable via this stretched link. One link rather
          than several keeps the tab order sane and stops screen readers
          announcing the same destination three times.
        */}
        <h3 className="text-sm font-medium text-ink">
          <Link
            href={routes.listing(listing.slug)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            <span className="line-clamp-2">{listing.title}</span>
          </Link>
        </h3>

        <p className="text-sm text-ink-muted">
          {roomTypeLabels[listing.roomType]} · {listing.localityName}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <PostedByBadge postedBy={listing.postedBy} />
          <FreshnessLabel publishedAt={listing.publishedAt} />
        </div>
      </div>
    </article>
  );
}
