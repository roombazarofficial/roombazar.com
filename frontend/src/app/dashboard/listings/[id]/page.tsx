import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { MarkAsTakenButton } from "@/components/listing/markastakenbutton";
import { ListingGallery } from "@/components/listing/listinggallery";
import { getMyListing } from "@/lib/api/listings";
import { formatRupees } from "@/lib/format/rupees";
import { roomTypeLabels, furnishingLabels } from "@/lib/constants/roomtypes";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const listing = await getMyListing(id);
  
  if (!listing) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="size-14 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-ink-muted text-2xl">
          🔍
        </div>
        <h1 className="text-xl font-bold text-ink">Listing Not Found</h1>
        <p className="text-sm text-ink-muted">
          This ad could not be found or your session may have expired.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href={routes.myListings} className={buttonStyles({ variant: "primary" })}>
            My Listings
          </Link>
          <Link href={routes.post} className={buttonStyles({ variant: "secondary" })}>
            Post New Ad
          </Link>
        </div>
      </div>
    );
  }

  const isActive = listing.status === "active";
  const localityName = listing.locality?.name || "Local Area";
  const cityName = listing.city?.name || "";
  const locationLabel = cityName ? `${localityName}, ${cityName}` : localityName;
  const photos = listing.photos || [];
  const amenities = listing.amenities || [];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Navigation Breadcrumb & Quick Link */}
      <div className="flex items-center justify-between">
        <Link
          href={routes.myListings}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all listings
        </Link>

        <div className="flex items-center gap-2">
          {isActive ? (
            <Badge tone="success" dot>Live on RoomBazar</Badge>
          ) : listing.status === "expired" ? (
            <Badge tone="warning">Expired</Badge>
          ) : (
            <Badge tone="neutral">Taken</Badge>
          )}
        </div>
      </div>

      {/* Main Image Gallery with 'roombazar' watermark (OLX Style) */}
      <section className="rounded-2xl border border-line bg-surface p-3 sm:p-4 shadow-sm">
        <ListingGallery photos={photos} title={listing.title} />
      </section>

      {/* Title & Price Header Card */}
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
              {listing.title}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-ink-muted">
              <svg className="size-4 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationLabel}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              {formatRupees(listing.rentPaise || 0)}
            </span>
            <span className="text-xs sm:text-sm text-ink-muted"> / month</span>
            {listing.negotiable && (
              <span className="ml-2 inline-block rounded bg-brand-50 px-2 py-0.5 text-2xs font-semibold text-brand-700">
                Negotiable
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-5 border-t border-line">
          {isActive && <MarkAsTakenButton listingId={listing.id} size="md" />}
          {listing.status === "expired" && (
            <Button size="md">Renew for 30 days</Button>
          )}

          <Link
            href={routes.editListing(listing.id)}
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            Edit details
          </Link>

          <Link
            href={routes.listingPhotos(listing.id)}
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            Manage photos ({photos.length})
          </Link>

          <Link
            href={routes.listing(listing.slug)}
            className={buttonStyles({ variant: "ghost", size: "md" })}
          >
            View public ad
          </Link>
        </div>
      </div>

      {/* OLX-Style Overview Specs Card */}
      <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-line pb-3">
          Overview
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <OverviewItem
            icon="🏠"
            label="Property Type"
            value={roomTypeLabels[listing.roomType] || "Room"}
          />
          <OverviewItem
            icon="🛋️"
            label="Furnishing"
            value={furnishingLabels[listing.furnishing] || "Unfurnished"}
          />
          <OverviewItem
            icon="📍"
            label="Location"
            value={localityName}
          />
          <OverviewItem
            icon="📅"
            label="Available From"
            value={formatDate(listing.availableFrom)}
          />
          {listing.areaSqft && (
            <OverviewItem
              icon="📐"
              label="Super Area"
              value={`${listing.areaSqft} sq ft`}
            />
          )}
          {listing.floor != null && (
            <OverviewItem
              icon="🏢"
              label="Floor"
              value={`${listing.floor} of ${listing.totalFloors ?? "?"}`}
            />
          )}
          {listing.minStayMonths && (
            <OverviewItem
              icon="⏳"
              label="Min. Stay"
              value={`${listing.minStayMonths} months`}
            />
          )}
          <OverviewItem
            icon="⚡"
            label="Bills Included"
            value={listing.billsIncluded ? "Yes (Included)" : "No"}
          />
        </div>
      </section>

      {/* Description Section */}
      {listing.description && (
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-line pb-3">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-line text-xs sm:text-sm text-ink-muted leading-relaxed">
            {listing.description}
          </p>
        </section>
      )}

      {/* Performance Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total Views" value={String(listing.viewCount || 0)} hint="Seekers who opened this ad" />
        <Stat label="Photos Uploaded" value={String(photos.length)} hint="Photos with RoomBazar watermark" />
        <Stat label="Amenities Selected" value={String(amenities.length)} hint="Features highlighted" />
      </div>
    </div>
  );
}

function OverviewItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-surface-muted/50 p-3 border border-line/60">
      <span className="text-base sm:text-lg select-none">{icon}</span>
      <div>
        <span className="block text-[11px] font-medium text-ink-muted">{label}</span>
        <span className="block text-xs sm:text-sm font-semibold text-ink mt-0.5">{value}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-subtle">{hint}</p>}
    </div>
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return "Immediately";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Immediately";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "Immediately";
  }
}
