import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { MarkAsTakenButton } from "@/components/listing/markastakenbutton";
import { mockListings } from "@/lib/api/mockdata";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export default function Page() {
  const mine = mockListings.slice(0, 3);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          My listings
        </h1>
        <Link href={routes.post} className={buttonStyles()}>
          Post a room
        </Link>
      </header>

      <ul className="mt-6 space-y-3">
        {mine.map((listing) => (
          <li
            key={listing.id}
            className="rounded-card border border-line bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={routes.listing(listing.slug)}
                  className="text-sm font-medium text-ink hover:underline"
                >
                  {listing.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {formatRupees(listing.rentPaise)}/month · {listing.locality.name}
                </p>
              </div>
              <Badge tone="success" dot>Active</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
              <span>{listing.viewCount} views</span>
              <span>Expires in 21 days</span>
            </div>

            {/*
              "Mark as taken" is the most important maintenance action in the
              product, so it is a first-class button here rather than an item
              hidden in an overflow menu. See docs/01-data-model.md.
            */}
            <div className="mt-4 flex flex-wrap gap-2">
              <MarkAsTakenButton listingId={listing.id} size="sm" />
              <Link
                href={routes.editListing(listing.id)}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Edit
              </Link>
              <Button size="sm" variant="ghost">Pause</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
