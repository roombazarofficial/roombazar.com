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
import { PostedByBadge } from "@/components/listing/postedbybadge";
import { FreshnessLabel } from "@/components/listing/freshnesslabel";
import { ListingGrid } from "@/components/listing/listinggrid";
import { Badge } from "@/components/ui/badge";
import { getListingBySlug, getSimilarListings } from "@/lib/api/listings";
import { roomTypeLabels, furnishingLabels } from "@/lib/constants/roomtypes";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ slug: string }>;

/**
 * Listing pages are prerendered and revalidated hourly rather than rendered
 * per request.
 *
 * A listing changes rarely once posted, and this is the page organic search
 * lands on most, so serving it from cache means a faster first paint on a
 * slow connection and far less compute per visit. Actions that genuinely
 * change a listing — marking it taken, editing it — will revalidate its path
 * directly once the backend exists.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const { mockListings } = await import("@/lib/api/mockdata");
  return mockListings
    .filter((listing) => listing.status === "active")
    .map((listing) => ({ slug: listing.slug }));
}

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
    // Taken and expired listings keep their URL and inbound links but drop
    // out of the index — see docs/02-architecture.md.
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

      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-muted">
          <Link href={routes.city(listing.city.slug)} className="hover:text-ink">
            {listing.city.name}
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={routes.locality(listing.city.slug, listing.locality.slug)}
            className="hover:text-ink"
          >
            {listing.locality.name}
          </Link>
        </nav>

        {!isLive && (
          <div className="mb-5 rounded-card border border-line-strong bg-surface-muted px-4 py-3">
            <p className="text-sm font-medium text-ink">
              This room is no longer available.
            </p>
            <Link
              href={routes.locality(listing.city.slug, listing.locality.slug)}
              className="mt-1 inline-block text-sm text-brand-700 hover:text-brand-800"
            >
              See other rooms in {listing.locality.name}
            </Link>
          </div>
        )}

        <ListingGallery photos={listing.photos} title={listing.title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <PostedByBadge postedBy={listing.postedBy} />
                <Badge tone="neutral">
                  {roomTypeLabels[listing.roomType]}
                </Badge>
                <Badge tone="neutral">
                  {furnishingLabels[listing.furnishing]}
                </Badge>
                {listing.negotiable && <Badge tone="info">Negotiable</Badge>}
              </div>

              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                {listing.title}
              </h1>

              <p className="mt-1.5 text-sm text-ink-muted">
                {listing.locality.name}, {listing.city.name}
              </p>

              <FreshnessLabel
                publishedAt={listing.publishedAt ?? listing.createdAt}
                className="mt-2 block"
              />
            </header>

            <ListingRent listing={listing} className="mt-6" />

            <section className="mt-8">
              <h2 className="text-base font-semibold text-ink">
                About this room
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                {listing.description}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-base font-semibold text-ink">Details</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                <Detail label="Available from" value={formatDate(listing.availableFrom)} />
                {listing.areaSqft && (
                  <Detail label="Area" value={`${listing.areaSqft} sq ft`} />
                )}
                {listing.floor != null && (
                  <Detail
                    label="Floor"
                    value={`${listing.floor} of ${listing.totalFloors ?? "?"}`}
                  />
                )}
                {listing.minStayMonths && (
                  <Detail
                    label="Minimum stay"
                    value={`${listing.minStayMonths} months`}
                  />
                )}
              </dl>
            </section>

            <ListingAmenities amenities={listing.amenities} className="mt-8" />

            <ListingLocalityMap listing={listing} className="mt-8" />

            <PaymentSafetyNotice className="mt-8" />
          </div>

          {/*
            Sticky on desktop so the contact action is always reachable while
            reading. On mobile it sits after the content and the primary
            action repeats in a fixed bar.
          */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ListingListerPanel listing={listing} />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16 border-t border-line pt-8">
            <h2 className="mb-5 text-xl font-semibold text-ink">
              Similar rooms in {listing.city.name}
            </h2>
            <ListingGrid listings={similar} />
          </section>
        )}
      </div>
    </SiteShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
