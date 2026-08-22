import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingGallery } from "@/components/listing/listinggallery";
import { ListingRent } from "@/components/listing/listingrent";
import { ListingAmenities } from "@/components/listing/listingamenities";
import { ListingListerPanel } from "@/components/listing/listinglisterpanel";
import { PaymentSafetyNotice } from "@/components/listing/paymentsafetynotice";
import { ListingLocalityMap } from "@/components/listing/listinglocalitymap";
import {
  ListingStructuredData,
  BreadcrumbStructuredData,
} from "@/components/common/structureddata";
import { FreshnessLabel } from "@/components/listing/freshnesslabel";
import { SaveListingButton } from "@/components/listing/savelistingbutton";
import { ListingGrid } from "@/components/listing/listinggrid";
import { Badge } from "@/components/ui/badge";
import { getListingBySlug, getSimilarListings } from "@/lib/api/listings";
import { roomTypeLabels, furnishingLabels } from "@/lib/constants/roomtypes";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};

  const isLive = listing.status === "active";

  return {
    title: `${listing.title} — ${formatRupees(listing.rentPaise)}/month`,
    description: `${roomTypeLabels[listing.roomType]} in ${listing.locality.name}, ${listing.city.name}. ${formatRupees(listing.rentPaise)} per month, posted by ${listing.postedBy === "agent" ? "an agent" : "the owner"}.`,
    alternates: { canonical: routes.listing(listing.slug) },
    robots: isLive ? undefined : { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const similar = await getSimilarListings(listing);
  const isLive = listing.status === "active";

  return (
    <SiteShell>
      <ListingStructuredData listing={listing} />

      <BreadcrumbStructuredData
        trail={[
          { name: listing.city.name, path: routes.city(listing.city.slug) },
          {
            name: listing.locality.name,
            path: routes.locality(listing.city.slug, listing.locality.slug),
          },
          { name: listing.title, path: routes.listing(listing.slug) },
        ]}
      />

      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-6">
        {/* Breadcrumbs Navigation (OLX Style) */}
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-ink-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span>›</span>
          <Link href={routes.city(listing.city.slug)} className="hover:text-ink">
            {listing.city.name}
          </Link>
          <span>›</span>
          <Link
            href={routes.locality(listing.city.slug, listing.locality.slug)}
            className="hover:text-ink"
          >
            {listing.locality.name}
          </Link>
          <span>›</span>
          <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-xs">
            {listing.title}
          </span>
        </nav>

        {!isLive && (
          <div className="mb-5 rounded-xl border border-line-strong bg-surface-muted px-4 py-3.5 shadow-2xs">
            <p className="text-sm font-semibold text-ink">
              This room is no longer available.
            </p>
            <Link
              href={routes.locality(listing.city.slug, listing.locality.slug)}
              className="mt-1 inline-block text-xs sm:text-sm font-medium text-brand-600 hover:text-brand-700 underline"
            >
              See other available rooms in {listing.locality.name}
            </Link>
          </div>
        )}

        {/* 1. Full-Width Interactive Hero Image Gallery with 'roombazar' Watermark */}
        <ListingGallery photos={listing.photos} title={listing.title} listingId={listing.id} />

        {/* 2. OLX-Style 2-Column Content Layout */}
        <div className="mt-6 sm:mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left Column: Title, Overview, Description, Amenities, Map */}
          <div className="min-w-0 space-y-6">
            {/* Ad Header Title Card */}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">
                    {roomTypeLabels[listing.roomType]}
                  </Badge>
                  <Badge tone="neutral">
                    {furnishingLabels[listing.furnishing]}
                  </Badge>
                  {listing.negotiable && <Badge tone="info">Negotiable</Badge>}
                </div>

                <SaveListingButton
                  listingId={listing.id}
                  className="border border-line shadow-xs hover:border-brand-300"
                />
              </div>

              <h1 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-ink">
                {listing.title}
              </h1>

              <p className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-ink-muted">
                <svg className="size-4 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.locality.name}, {listing.city.name}
              </p>

              <FreshnessLabel
                publishedAt={listing.publishedAt ?? listing.createdAt}
                className="mt-2.5 block text-xs"
              />
            </div>

            {/* OLX-Style Overview Card */}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-line pb-3">
                Overview
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <OverviewBox
                  icon="🏠"
                  label="Type"
                  value={roomTypeLabels[listing.roomType] || "Room"}
                />
                <OverviewBox
                  icon="🛋️"
                  label="Furnishing"
                  value={furnishingLabels[listing.furnishing] || "Unfurnished"}
                />
                <OverviewBox
                  icon="📍"
                  label="Location"
                  value={listing.locality.name}
                />
                <OverviewBox
                  icon="📅"
                  label="Available From"
                  value={formatDate(listing.availableFrom)}
                />
                {listing.areaSqft && (
                  <OverviewBox
                    icon="📐"
                    label="Super Area"
                    value={`${listing.areaSqft} sq ft`}
                  />
                )}
                {listing.floor != null && (
                  <OverviewBox
                    icon="🏢"
                    label="Floor"
                    value={`${listing.floor} of ${listing.totalFloors ?? "?"}`}
                  />
                )}
                {listing.minStayMonths && (
                  <OverviewBox
                    icon="⏳"
                    label="Min. Stay"
                    value={`${listing.minStayMonths} mo`}
                  />
                )}
                <OverviewBox
                  icon="⚡"
                  label="Bills Included"
                  value={listing.billsIncluded ? "Yes" : "No"}
                />
              </div>
            </div>

            {/* Description Card */}
            {listing.description && (
              <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-line pb-3">
                  Description
                </h2>
                <p className="mt-3.5 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-ink-muted">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Pricing & Deposit Details */}
            <ListingRent listing={listing} />

            {/* Amenities & Rules */}
            <ListingAmenities amenities={listing.amenities} />

            {/* Approximate Location Map */}
            <ListingLocalityMap listing={listing} />

            {/* Safety & Anti-Fraud Notice (OLX Style) */}
            <PaymentSafetyNotice />
          </div>

          {/* Right Column: Sticky Price & Lister Panel */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <ListingListerPanel listing={listing} />
          </aside>
        </div>

        {/* Similar Listings Grid */}
        {similar.length > 0 && (
          <section className="mt-12 sm:mt-16 border-t border-line pt-8">
            <h2 className="mb-5 text-lg sm:text-xl font-bold tracking-tight text-ink">
              Similar listings in {listing.city.name}
            </h2>
            <ListingGrid listings={similar} />
          </section>
        )}
      </div>
    </SiteShell>
  );
}

function OverviewBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-surface-muted/60 p-3 border border-line/60">
      <span className="text-base sm:text-lg select-none">{icon}</span>
      <div>
        <span className="block text-[11px] font-medium text-ink-muted">{label}</span>
        <span className="block text-xs sm:text-sm font-semibold text-ink mt-0.5">{value}</span>
      </div>
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
