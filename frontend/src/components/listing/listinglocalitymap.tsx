import { cn } from "@/lib/utils/classnames";
import type { Listing } from "@/types/listing";

/**
 * Approximate location.
 *
 * Rendered as a circle, never a pin, and drawn from coordinates the server
 * has already fuzzed to roughly a 300m radius. An exact pin on an unverified
 * listing invites both address harvesting and, for the person living there, a
 * genuine safety risk. The precise position exists only for moderation.
 *
 * See docs/01-data-model.md.
 */
export function ListingLocalityMap({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  const hasPosition =
    listing.approximateLat != null && listing.approximateLng != null;

  return (
    <section className={cn(className)}>
      <h2 className="text-base font-semibold text-ink">Location</h2>

      <div className="mt-3 overflow-hidden rounded-card border border-line">
        <div className="relative flex aspect-video items-center justify-center bg-surface-sunken">
          {hasPosition ? (
            <>
              {/* Placeholder for the tile layer. The circle and its meaning
                  are the part that matters and are already correct. */}
              <span
                aria-hidden
                className="absolute size-32 rounded-full border-2 border-brand-500 bg-brand-500/15"
              />
              <span className="relative text-xs text-ink-muted">
                Approximate area
              </span>
            </>
          ) : (
            <span className="text-sm text-ink-subtle">
              Location not provided
            </span>
          )}
        </div>

        <p className="border-t border-line bg-surface px-4 py-3 text-sm text-ink">
          {listing.locality.name}, {listing.city.name}
        </p>
      </div>

      <p className="mt-2 text-xs text-ink-muted">
        We show the general area, not the exact address. The lister can share
        it with you once you are both in touch.
      </p>
    </section>
  );
}
