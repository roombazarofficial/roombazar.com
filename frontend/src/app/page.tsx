import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingCard } from "@/components/listing/listingcard";
import { HeroSearchBar } from "@/components/search/herosearchbar";
import { PopularLocations } from "@/components/home/popularlocations";
import { SpaceTypeGrid } from "@/components/home/spacetypegrid";
import { TrustStrip } from "@/components/home/truststrip";
import { CTABanner } from "@/components/home/ctabanner";
import { RecentlyViewedSection } from "@/components/home/recentlyviewedsection";
import { getRecentListings } from "@/lib/api/listings";
import { getCities } from "@/lib/api/geography";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const [cities, recent] = await Promise.all([
    getCities(),
    getRecentListings(8),
  ]);
  const popularLocations = Array.from(
    new Map(
      recent.map((listing) => [
        `${listing.citySlug}/${listing.localitySlug}`,
        {
          cityName: listing.cityName,
          citySlug: listing.citySlug,
          localityName: listing.localityName,
          localitySlug: listing.localitySlug,
        },
      ]),
    ).values(),
  ).slice(0, 6);

  return (
    <SiteShell>
      {/* ===== HERO SECTION ===== */}
      <section className="relative border-b border-line bg-gradient-to-b from-brand-50/50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 text-center sm:pt-14 sm:pb-16">
          {/* Controlled, Balanced Heading */}
          <h1 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] leading-[1.2]">
            Find a place that <span className="text-brand-600">feels like home</span>
          </h1>

          {/* Supporting Text */}
          <p className="mx-auto mt-3 max-w-lg text-sm text-ink-muted sm:text-base leading-relaxed">
            Browse rooms, flats, PGs, and commercial spaces — connect directly with owners.
          </p>

          {/* Unified Search Experience */}
          <HeroSearchBar cities={cities} />
        </div>
      </section>

      {/* ===== RECENTLY VIEWED (real per-browser history only) ===== */}
      <RecentlyViewedSection />

      {/* ===== SPACE TYPE DISCOVERY ===== */}
      <SpaceTypeGrid />

      {/* ===== POPULAR LOCATIONS ===== */}
      {popularLocations.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-2 pb-10">
          <div className="flex items-end justify-between mb-1">
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-brand-600">
                Nearby
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-ink sm:text-xl">
                Popular locations
              </h2>
            </div>
          </div>
          <PopularLocations locations={popularLocations} />
        </section>
      )}

      {/* ===== RECENTLY POSTED ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-2 pb-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-2xs font-bold uppercase tracking-widest text-brand-600">
              Fresh listings
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-ink sm:text-xl">
              Recently posted
            </h2>
          </div>
          <Link
            href={routes.rooms}
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 sm:text-sm"
          >
            See all
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="size-3.5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        {recent.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.slice(0, 8).map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-muted py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="size-7"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink">No rooms yet</h3>
            <p className="mt-1.5 max-w-xs text-sm text-ink-muted">
              Be the first to post a room on RoomBazar.
            </p>
            <Link
              href={routes.post}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700"
            >
              Post a room
            </Link>
          </div>
        )}
      </section>

      {/* ===== TRUST STRIP ===== */}
      <TrustStrip />

      {/* ===== HOST CTA BANNER ===== */}
      <CTABanner />
    </SiteShell>
  );
}
