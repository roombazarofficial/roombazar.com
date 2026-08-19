import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingCard } from "@/components/listing/listingcard";
import { HeroSearchBar } from "@/components/search/herosearchbar";
import { HeroCityscapePattern } from "@/components/home/herocityscapepattern";
import { getRecentListings } from "@/lib/api/listings";
import { localities } from "@/lib/api/mockdata";
import { formatRupeesCompact } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const recent = await getRecentListings(4);

  return (
    <SiteShell>
      {/* =========================================================================
          HERO SECTION with Bengaluru Cityscape & Landmark Skyline Illustration
          ========================================================================= */}
      <section className="relative border-b border-line bg-white">
        {/* Cityscape Skyline Background Illustration */}
        <HeroCityscapePattern />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-12 text-center sm:pt-20 sm:pb-16">
          <h1 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Looking for a place? Start here.
          </h1>
          <p className="mx-auto mt-2.5 max-w-lg text-sm text-ink-muted sm:text-base">
            Browse rooms, talk to owners directly, and arrange a visit.
          </p>

          {/* Search Pill Component */}
          <HeroSearchBar localities={localities} />

          {/* Post Room Link */}
          <p className="mt-5 text-sm text-ink-muted">
            Have a room to rent?{" "}
            <Link
              href={routes.post}
              className="font-medium text-brand-600 underline underline-offset-4 transition-colors hover:text-brand-700"
            >
              Post it free
            </Link>
          </p>
        </div>
      </section>

      {/* =========================================================================
          EXPLORE POPULAR LOCATIONS
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink sm:text-lg">
            Explore popular locations
          </h2>

          {/* Carousel Pagination Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous localities"
              className="flex size-7 items-center justify-center rounded-full border border-line bg-white text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next localities"
              className="flex size-7 items-center justify-center rounded-full border border-line bg-white text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* 5 Locality Cards Grid */}
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {localities.slice(0, 5).map((locality) => (
            <Link
              key={locality.id}
              href={routes.locality(locality.citySlug, locality.slug)}
              className="rounded-xl border border-line bg-white p-3.5 transition-all hover:border-line-strong hover:shadow-xs"
            >
              <p className="text-xs font-bold text-ink sm:text-sm">{locality.name}</p>
              <p className="mt-1 text-2xs text-ink-muted">
                {locality.activeListingCount} rooms
                {locality.medianRentPaise
                  ? ` · from ${formatRupeesCompact(locality.medianRentPaise)}`
                  : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          RECENTLY POSTED ROOMS
          ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-2 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink sm:text-lg">Recently posted</h2>
          <Link
            href={routes.city("bengaluru")}
            className="text-xs font-semibold text-brand-600 underline underline-offset-4 transition-colors hover:text-brand-700 sm:text-sm"
          >
            See all rooms
          </Link>
        </div>

        {/* 4 Cards Grid with Next Arrow */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} priority={index === 0} />
            ))}
          </div>

          {/* Right Floating Carousel Arrow */}
          <button
            type="button"
            aria-label="Next listings"
            className="absolute -right-3.5 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white p-2 text-ink shadow-md transition-all hover:scale-105 hover:bg-surface-muted lg:flex"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
    </SiteShell>
  );
}
