import Link from "next/link";
import { SaveListingButton } from "./savelistingbutton";
import { formatRupees } from "@/lib/format/rupees";
import { formatAvailability } from "@/lib/format/dates";
import { furnishingLabels } from "@/lib/constants/roomtypes";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";
import type { ListingSummary, PostedBy } from "@/types/listing";

const postedByLabels: Record<PostedBy, string> = {
  owner: "Owner posted",
  tenant: "Current tenant",
  agent: "Agent posted",
};

export function ListingCard({
  listing,
  priority = false,
  className,
}: {
  listing: ListingSummary;
  priority?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-xs",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {/* Listing Photo */}
      <div className="relative aspect-4/3 overflow-hidden bg-surface-sunken">
        {listing.coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverPhoto.url}
            alt={listing.title}
            loading={priority ? "eager" : "lazy"}
            width={listing.coverPhoto.width}
            height={listing.coverPhoto.height}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-ink-subtle">
            No photo
          </div>
        )}

        {/* Save Button with red heart on top right */}
        <SaveListingButton
          listingId={listing.id}
          initialSaved={listing.isSaved}
          className="absolute right-2.5 top-2.5 z-10 flex size-7 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-sm transition-transform hover:scale-110"
        />
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div className="space-y-1">
          {/* Price */}
          <p className="text-base font-bold tracking-tight text-ink">
            {formatRupees(listing.rentPaise)}
            <span className="text-xs font-normal text-ink-muted">/month</span>
          </p>

          {/* Title */}
          <h3 className="text-xs font-semibold text-ink line-clamp-1">
            <Link
              href={routes.listing(listing.slug)}
              className="hover:text-brand-600 transition-colors after:absolute after:inset-0 after:content-['']"
            >
              {listing.title}
            </Link>
          </h3>

          {/* Location */}
          <p className="text-xs text-ink-muted line-clamp-1">
            {listing.localityName}, {listing.cityName}
          </p>
        </div>

        {/* Badges / Chips row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded bg-[#FEF3C7] px-2 py-0.5 text-2xs font-medium text-[#92400E]">
            {furnishingLabels[listing.furnishing] || "Furnished"}
          </span>
          <span className="inline-flex items-center rounded bg-[#F3F4F6] px-2 py-0.5 text-2xs font-medium text-[#4B5563]">
            {formatAvailability(listing.availableFrom)}
          </span>
        </div>

        {/* Posted by user row */}
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-line/60 pt-2 text-2xs text-ink-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3 text-ink-muted"
            aria-hidden
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{postedByLabels[listing.postedBy] || "Owner posted"}</span>
        </div>
      </div>
    </article>
  );
}
