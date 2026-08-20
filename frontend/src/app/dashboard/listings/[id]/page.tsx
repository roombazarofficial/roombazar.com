import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { MarkAsTakenButton } from "@/components/listing/markastakenbutton";
import { getMyListing } from "@/lib/api/listings";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const listing = await getMyListing(id);
  if (!listing) notFound();

  const isActive = listing.status === "active";

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

          <p className="mt-1 text-sm text-ink-muted">
            {formatRupees(listing.rentPaise)}/month {"\u00b7"} {listing.locality.name}

          </p>

        </div>

        {isActive ? (
          <Badge tone="success" dot>Live</Badge>

        ) : listing.status === "expired" ? (
          <Badge tone="warning">Expired</Badge>

        ) : (
          <Badge tone="neutral">Taken</Badge>

        )}
      </header>

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-xs text-ink-muted">{label}</p>

      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>

    </div>

  );
}
