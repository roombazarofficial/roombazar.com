import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingGrid } from "@/components/listing/listinggrid";
import { HeroSearchBar } from "@/components/search/herosearchbar";
import { getRecentListings } from "@/lib/api/listings";
import { localities } from "@/lib/api/mockdata";
import { formatRupeesCompact } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const recent = await getRecentListings(8);

  return (
    <SiteShell>
      {/*
        The hero states the proposition in one line. The differentiator is not
        "find a room" — every portal claims that — it is that there is no
        broker fee, so that is what the headline says.
      */}
      <section className="border-b border-line bg-gradient-to-b from-brand-50 to-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
            Rooms for rent, direct from owners.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-ink-muted sm:text-lg">
            No broker fees. No commission. Message the person who actually has
            the room and arrange a visit yourself.
          </p>

          <HeroSearchBar localities={localities} />

          {/*
            Secondary to the search bar now. Someone who knows they want to
            list rather than search still needs an obvious way through.
          */}
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

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-xl font-semibold text-ink">
          Popular localities in Bengaluru
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {localities.map((locality) => (
            <Link
              key={locality.id}
              href={routes.locality(locality.citySlug, locality.slug)}
              className="rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-raised"
            >
              <p className="text-sm font-medium text-ink">{locality.name}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {locality.activeListingCount} rooms
                {locality.medianRentPaise
                  ? ` · from ${formatRupeesCompact(locality.medianRentPaise)}`
                  : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">Recently posted</h2>
          <Link
            href={routes.city("bengaluru")}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            See all rooms
          </Link>
        </div>

        <ListingGrid listings={recent} />
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
