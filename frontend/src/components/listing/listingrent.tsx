import { cn } from "@/lib/utils/classnames";
import { formatRupees, depositInMonths } from "@/lib/format/rupees";
import type { Listing } from "@/types/listing";

/**
 * Rent, deposit and what is included, together in one block.
 *
 * Deposit is shown in months as well as rupees because that is how listers
 * quote it and how seekers compare it — "2 months" lands faster than
 * "₹28,000" when you are scanning several rooms.
 */
export function ListingRent({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  const months = depositInMonths(listing.depositPaise, listing.rentPaise);

  return (
    <div className={cn("rounded-card border border-line bg-surface-muted p-5", className)}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl font-semibold text-ink">
          {formatRupees(listing.rentPaise)}
        </span>
        <span className="text-base text-ink-muted">per month</span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Deposit</dt>
          <dd className="text-right font-medium text-ink">
            {formatRupees(listing.depositPaise)}
            {months ? (
              <span className="ml-1 font-normal text-ink-muted">
                ({months} {months === 1 ? "month" : "months"})
              </span>
            ) : null}
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Maintenance</dt>
          <dd className="text-right font-medium text-ink">
            {listing.maintenancePaise
              ? `${formatRupees(listing.maintenancePaise)}/month`
              : "Included"}
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Electricity and water</dt>
          <dd className="text-right font-medium text-ink">
            {listing.billsIncluded ? "Included" : "Billed separately"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
