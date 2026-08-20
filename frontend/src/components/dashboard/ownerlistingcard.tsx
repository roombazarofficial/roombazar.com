import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { MarkAsTakenButton } from "@/components/listing/markastakenbutton";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";
import type { Listing } from "@/types/listing";

export function OwnerListingCard({ listing }: { listing: Listing }) {
  const isActive = listing.status === "active";

  const daysUntilExpiry = listing.expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(listing.expiresAt).getTime() - Date.now()) / 86_400_000,
        ),
      )
    : null;

  const expiringSoon =
    isActive && daysUntilExpiry !== null && daysUntilExpiry <= 10;

  const missing = [
    (listing.photos?.length ?? 0) < 3 && "more photos",
    (listing.amenities?.length ?? 0) === 0 && "amenities",
    !listing.areaSqft && "area in sq ft",
    (listing.description?.trim().length ?? 0) < 120 && "a fuller description",
  ].filter(Boolean) as string[];

  return (
    <article className="rounded-card border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={routes.myListing(listing.id)}
            className="text-sm font-medium text-ink hover:underline"
          >
            {listing.title}
          </Link>

          <p className="mt-0.5 text-xs text-ink-muted">
            {formatRupees(listing.rentPaise)}/month · {listing.locality.name} ·{" "}

            {listing.photos?.length ?? 0} photo{listing.photos?.length === 1 ? "" : "s"}
          </p>

        </div>

        <StatusBadge status={listing.status} />

      </div>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <div className="flex gap-1.5">
          <dt className="text-ink-muted">Views</dt>

          <dd className="font-medium tabular-nums text-ink">
            {listing.viewCount}
          </dd>

        </div>

        {isActive && daysUntilExpiry !== null && (
          <div className="flex gap-1.5">
            <dt className="text-ink-muted">Expires in</dt>

            <dd
              className={
                expiringSoon
                  ? "font-medium text-warning"
                  : "font-medium tabular-nums text-ink"
              }
            >
              {daysUntilExpiry} days
            </dd>

          </div>

        )}
      </dl>

      {isActive && missing.length > 0 && (
        <div className="mt-3 rounded-control bg-surface-muted px-3 py-2.5">
          <p className="text-xs text-ink-muted">
            This room gets fewer views than similar ones. Adding{" "}
            <strong className="font-medium text-ink">
              {missing.join(", ")}
            </strong>{" "}

            would help.
          </p>

        </div>

      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {isActive && <MarkAsTakenButton listingId={listing.id} size="sm" />}

        {listing.status === "expired" && (
          <Link
            href={routes.myListing(listing.id)}
            className={buttonStyles({ size: "sm" })}
          >
            Renew listing
          </Link>

        )}

        <Link
          href={routes.editListing(listing.id)}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          Edit
        </Link>

        {isActive && (
          <Link
            href={routes.listing(listing.slug)}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            View public page
          </Link>
        )}

      </div>

    </article>

  );
}

function StatusBadge({ status }: { status: Listing["status"] }) {
  switch (status) {
    case "active":
      return <Badge tone="success" dot>Live</Badge>;

    case "taken":
      return <Badge tone="neutral">Taken</Badge>;

    case "expired":
      return <Badge tone="warning">Expired</Badge>;

    case "paused":
      return <Badge tone="neutral">Paused</Badge>;

    case "suspended":
      return <Badge tone="danger">Suspended</Badge>;

    case "pendingapproval":
      return <Badge tone="warning">Pending approval</Badge>;

    case "rejected":
      return <Badge tone="danger">Needs changes</Badge>;

    default:
      return <Badge tone="neutral">Draft</Badge>;

  }
}
