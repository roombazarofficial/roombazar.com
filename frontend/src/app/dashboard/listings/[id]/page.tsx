import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { MarkAsTakenButton } from "@/components/listing/markastakenbutton";
import { ListingGallery } from "@/components/listing/listinggallery";
import { getMyListing } from "@/lib/api/listings";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const listing = await getMyListing(id);
  if (!listing) notFound();

  const isActive = listing.status === "active";
  const hasCoordinates =
    listing.approximateLat != null && listing.approximateLng != null;
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.approximateLat},${listing.approximateLng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${listing.locality.name}, ${listing.city.name}`,
      )}`;

  return (
    <div className="max-w-3xl">
      <Link
        href={routes.myListings}
        className="text-sm text-ink-muted hover:text-ink"
      >
        Back to all listings
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {listing.title}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span>
              {formatRupees(listing.rentPaise)}/month · {listing.locality.name},{" "}
              {listing.city.name}
            </span>
            <span>·</span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2"
            >
              📍 Get Directions ↗
            </a>
          </div>
        </div>

        <ListingStatusBadge status={listing.status} />
      </header>

      {listing.status === "pendingapproval" && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
          <p className="font-semibold flex items-center gap-1.5">
            <span>⏳</span> Waiting for Admin Approval
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Your ad has been submitted to the moderation queue. The super admin will review it, and once approved, your room will go live for seekers immediately.
          </p>
        </div>
      )}

      {/* Room Photo Gallery Preview */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
        <ListingGallery photos={listing.photos} title={listing.title} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Views" value={String(listing.viewCount)} />
        <Stat label="Photos" value={String(listing.photos.length)} />
        <Stat label="Amenities" value={String(listing.amenities.length)} />
      </div>

      <section className="mt-10 border-t border-line pt-6">
        <div className="flex flex-wrap gap-2">
          {isActive && <MarkAsTakenButton listingId={listing.id} size="lg" />}

          {listing.status === "expired" && (
            <Button size="lg">Renew for 30 days</Button>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: "secondary", size: "lg" })}
          >
            📍 Directions
          </a>

          <Link
            href={routes.editListing(listing.id)}
            className={buttonStyles({ variant: "secondary", size: "lg" })}
          >
            Edit details
          </Link>

          <Link
            href={routes.listingPhotos(listing.id)}
            className={buttonStyles({ variant: "secondary", size: "lg" })}
          >
            Manage photos
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {isActive && (
            <Button variant="ghost" size="sm">
              Pause listing
            </Button>
          )}
          <Link
            href={routes.listing(listing.slug)}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            View public page
          </Link>

          <Button variant="ghost" size="sm" className="text-danger">
            Delete
          </Button>
        </div>
      </section>
    </div>
  );
}

function ListingStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge tone="success" dot>Live</Badge>;
    case "pendingapproval":
      return <Badge tone="warning" dot>Pending approval</Badge>;
    case "rejected":
      return <Badge tone="danger">Needs changes</Badge>;
    case "paused":
      return <Badge tone="neutral">Paused</Badge>;
    case "taken":
      return <Badge tone="neutral">Taken</Badge>;
    case "expired":
      return <Badge tone="warning">Expired</Badge>;
    default:
      return <Badge tone="neutral">Draft</Badge>;
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
