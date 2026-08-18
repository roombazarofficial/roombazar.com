import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingGrid } from "@/components/listing/listinggrid";
import { HeroSearchBar } from "@/components/search/herosearchbar";
import { EmptyState } from "@/components/ui/emptystate";
import { buttonStyles } from "@/components/ui/button";
import { getRecentListings } from "@/lib/api/listings";
import { getCities, getLocalities } from "@/lib/api/geography";
import { formatRupeesCompact } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const cities = await getCities();
  const primary = cities[0];

  const [recent, localities] = primary
    ? await Promise.all([
        getRecentListings(primary.slug, 8),
        getLocalities(primary.slug),
      ])
    : [[], []];

  return (
    <SiteShell>
      <section className="border-b border-line bg-gradient-to-b from-brand-50 to-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
            Rooms for rent, direct from owners.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-ink-muted sm:text-lg">
            No broker fees. No commission. Message the person who actually has
            the room and arrange a visit yourself.
          </p>

          <HeroSearchBar
            localities={localities}
            citySlug={primary?.slug ?? "bengaluru"}
          />

          <p className="mt-6 text-sm text-ink-muted">
            Have a room to rent?{" "}
            <Link
              href={routes.post}
              className="font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800"
            >
              Post it free
            </Link>

          </p>

        </div>

      </section>

      {localities.length > 0 && primary && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-xl font-semibold text-ink">
            Popular localities in {primary.name}
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {localities.slice(0, 10).map((locality) => (
              <Link
                key={locality.id}
                href={routes.locality(primary.slug, locality.slug)}
                className="rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-raised"
              >
                <p className="text-sm font-medium text-ink">{locality.name}</p>

                {locality.medianRentPaise ? (
                  <p className="mt-1 text-xs text-ink-muted">
                    from {formatRupeesCompact(locality.medianRentPaise)}
                  </p>

                ) : null}
              </Link>

            ))}
          </div>

        </section>

      )}

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">Recently posted</h2>

          {primary && (
            <Link
              href={routes.city(primary.slug)}
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              See all rooms
            </Link>

          )}
        </div>

        {recent.length > 0 ? (
          <ListingGrid listings={recent} />

        ) : (
          <EmptyState
            title="No rooms listed yet"
            description="Be the first. Posting is free and takes about three minutes."
            action={
              <Link href={routes.post} className={buttonStyles()}>
                Post your room
              </Link>

            }
          />

        )}
      </section>

      <section className="border-t border-line bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-xl font-semibold text-ink">How RoomBazar works</h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Search without signing up",
                body: "Browse every listing, filter by locality and rent, and see who posted each room before you create an account.",
              },
              {
                step: "2",
                title: "Message directly",
                body: "Contact the lister through RoomBazar. Phone numbers stay hidden until both of you agree to share them.",
              },
              {
                step: "3",
                title: "Visit and decide",
                body: "Arrange a visit and settle the rent between yourselves. We take no commission and never handle your money.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-ink-inverse">
                  {item.step}
                </span>

                <h3 className="mt-3 text-base font-medium text-ink">
                  {item.title}
                </h3>

                <p className="mt-1.5 text-sm text-ink-muted">{item.body}</p>

              </div>

            ))}
          </div>

        </div>

      </section>

    </SiteShell>

  );
}
