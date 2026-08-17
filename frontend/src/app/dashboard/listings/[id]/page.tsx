import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { MarkAsTakenButton } from "@/components/listing/markastakenbutton";
import { mockListings } from "@/lib/api/mockdata";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const listing = mockListings.find((item) => item.id === id);
  if (!listing) notFound();

  return (
    <div className="max-w-3xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {listing.title}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {formatRupees(listing.rentPaise)}/month · {listing.locality.name}
          </p>
        </div>
        <Badge tone="success" dot>Active</Badge>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Views" value={String(listing.viewCount)} />
        <Stat label="Enquiries" value="4" />
        <Stat label="Expires in" value="21 days" />
      </div>

      {/*
        Marking a room taken is the transition that protects the metric this
        whole product is judged on, so it is the primary action here and
        reachable from the card, the email and the notification too.
      */}
      <div className="mt-6 flex flex-wrap gap-2">
        <MarkAsTakenButton listingId={listing.id} size="lg" />
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
        <Button variant="ghost" size="sm">Pause listing</Button>
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
