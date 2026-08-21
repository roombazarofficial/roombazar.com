import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingCard } from "@/components/listing/listingcard";
import { HeroSearchBar } from "@/components/search/herosearchbar";
import { HeroCityscapePattern } from "@/components/home/herocityscapepattern";
import { PopularLocations } from "@/components/home/popularlocations";
import { getRecentListings } from "@/lib/api/listings";
import { getCities } from "@/lib/api/geography";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const [cities, recent] = await Promise.all([
    getCities(),
    getRecentListings(4),
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
  ).slice(0, 5);

  return (
    <SiteShell>
      <section className="relative border-b border-line bg-white">
        <HeroCityscapePattern />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-12 text-center sm:pt-20 sm:pb-16">
          <h1 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Looking for a place? Start here.
          </h1>
          <p className="mx-auto mt-2.5 max-w-lg text-sm text-ink-muted sm:text-base">
            Browse rooms, talk to owners directly, and arrange a visit.
          </p>

          <HeroSearchBar cities={cities} />

          <p className="mt-5 text-sm text-ink-muted">
            Have a room to rent?{" "}
            <Link
              href={routes.post}
              className="font-medium text-brand-600 underline underline-offset-4 transition-colors hover:text-brand-700"
            >
              Host a room
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink sm:text-lg">
            Explore popular locations
          </h2>

        </div>
        <PopularLocations locations={popularLocations} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-2 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink sm:text-lg">Recently posted</h2>
          <Link
            href={routes.rooms}
            className="text-xs font-semibold text-brand-600 underline underline-offset-4 transition-colors hover:text-brand-700 sm:text-sm"
          >
            See all rooms
          </Link>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} priority={index === 0} />
            ))}
          </div>

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
