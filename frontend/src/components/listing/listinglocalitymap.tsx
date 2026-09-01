import { cn } from "@/lib/utils/classnames";
import type { Listing } from "@/types/listing";

export function ListingLocalityMap({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  const hasCoordinates =
    listing.approximateLat != null && listing.approximateLng != null;

  // Generate Google Maps Directions URL
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.approximateLat},${listing.approximateLng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${listing.locality.name}, ${listing.city.name}`,
      )}`;

  return (
    <section className={cn(className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Location</h2>

        {/* Get Directions Button */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-2xs transition-all hover:border-brand-400 hover:bg-brand-600 hover:text-white hover:shadow-xs active:scale-[0.98]"
          title="Open directions in Google Maps"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 shrink-0"
            aria-hidden
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span>Get Directions</span>
          <span aria-hidden>→</span>
        </a>
      </div>

      <div className="mt-3 overflow-hidden rounded-card border border-line">
        <div className="relative flex aspect-video items-center justify-center bg-surface-sunken">
          {hasCoordinates ? (
            <>
              {/* Radius circle representing neighborhood */}
              <span
                aria-hidden
                className="absolute size-32 rounded-full border-2 border-brand-500 bg-brand-500/15 animate-pulse-brand"
              />

              <div className="relative flex flex-col items-center gap-1">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-card">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="text-xs font-medium text-ink-muted">
                  Approximate neighborhood
                </span>
              </div>
            </>
          ) : (
            <span className="text-sm text-ink-subtle">
              Location approximate
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-line bg-surface px-4 py-3 gap-2">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4 text-brand-600 shrink-0"
              aria-hidden
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-sm font-semibold text-ink">
              {listing.locality.name}, {listing.city.name}
            </p>
          </div>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors sm:self-center"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>

      <p className="mt-2 text-xs text-ink-muted">
        We show the general area to protect privacy. The exact street address is
        shared directly by the owner upon contact.
      </p>
    </section>
  );
}
