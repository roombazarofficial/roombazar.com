import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingGrid } from "@/components/listing/listinggrid";
import { getRecentListings } from "@/lib/api/listings";
import { bengaluru, localities } from "@/lib/api/mockdata";
import { formatRupeesCompact } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Browse rooms for rent",
  description:
    "Rooms, PGs, flats and hostel beds for rent across India, posted directly by owners.",
};

export default async function Page() {
  const recent = await getRecentListings(8);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Browse rooms
        </h1>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-ink">Cities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={routes.city(bengaluru.slug)}
              className="rounded-card border border-line bg-surface px-4 py-3 text-sm hover:shadow-raised"
            >
              <span className="font-medium text-ink">{bengaluru.name}</span>
              <span className="ml-2 text-xs text-ink-muted">
                {bengaluru.activeListingCount} rooms
              </span>
            </Link>
            <span className="rounded-card border border-dashed border-line-strong px-4 py-3 text-sm text-ink-subtle">
              More cities coming soon
            </span>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-ink">
            Popular localities
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {localities.map((locality) => (
              <Link
                key={locality.id}
                href={routes.locality(locality.citySlug, locality.slug)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-line-strong hover:text-ink"
              >
                {locality.name}
                {locality.medianRentPaise && (
                  <span className="ml-1.5 text-xs text-ink-subtle">
                    from {formatRupeesCompact(locality.medianRentPaise)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-ink">
            Recently posted
          </h2>
          <ListingGrid listings={recent} />
        </section>
      </div>
    </SiteShell>
  );
}
