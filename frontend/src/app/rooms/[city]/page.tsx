import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingGrid } from "@/components/listing/listinggrid";
import { FilterPanel } from "@/components/search/filterpanel";
import { FilterDrawer } from "@/components/search/filterdrawer";
import { ActiveFilterChips } from "@/components/search/activefilterchips";
import { SortSelect } from "@/components/search/sortselect";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/emptystate";
import { buttonStyles } from "@/components/ui/button";
import { searchListings } from "@/lib/api/listings";
import { bengaluru, localities } from "@/lib/api/mockdata";
import { parseSearchParams, buildSearchQuery } from "@/lib/utils/querystring";
import { routes } from "@/lib/constants/routes";
import Link from "next/link";

type Params = Promise<{ city: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { city } = await params;
  if (city !== bengaluru.slug) return {};

  return {
    title: `Rooms for rent in ${bengaluru.name}`,
    description: `${bengaluru.activeListingCount} rooms, PGs and flats for rent in ${bengaluru.name}, posted directly by owners. No broker fees.`,
    alternates: { canonical: routes.city(city) },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { city } = await params;
  if (city !== bengaluru.slug) notFound();

  const filters = parseSearchParams(await searchParams, city);
  const results = await searchListings(filters);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Rooms for rent in {bengaluru.name}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {results.totalItems}{" "}
            {results.totalItems === 1 ? "room" : "rooms"} available now
          </p>
        </header>

        <div className="mt-8 flex gap-8">
          {/*
            Sidebar on desktop, drawer on mobile. Filters are the whole value
            of this page, so they are never more than one tap away.
          */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterPanel
              filters={filters}
              localities={localities}
              citySlug={city}
            />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="hidden text-sm text-ink-muted sm:block">
                Showing {results.items.length} of {results.totalItems}
              </p>

              <div className="flex items-center gap-2">
                <FilterDrawer
                  filters={filters}
                  localities={localities}
                  citySlug={city}
                />
                <SortSelect current={filters.sort} />
              </div>
            </div>

            <ActiveFilterChips filters={filters} localities={localities} />

            {results.items.length > 0 ? (
              <>
                <ListingGrid listings={results.items} />
                <Pagination
                  page={results.page}
                  totalPages={results.totalPages}
                  buildHref={(page) =>
                    `${routes.city(city)}${buildSearchQuery({ ...filters, page })}`
                  }
                />
              </>
            ) : (
              <EmptyState
                title="No rooms match these filters"
                description="Try widening your rent range or removing a locality. New rooms are posted every day."
                action={
                  <Link href={routes.city(city)} className={buttonStyles({ variant: "secondary" })}>
                    Clear all filters
                  </Link>
                }
              />
            )}
          </div>
        </div>

        {/*
          Locality links are the organic entry point for queries like
          "single room in Koramangala". They belong on the city page as real
          crawlable links, not behind a JavaScript filter widget.
        */}
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="text-base font-semibold text-ink">
            Browse by locality
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {localities.map((locality) => (
              <Link
                key={locality.id}
                href={routes.locality(city, locality.slug)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-line-strong hover:text-ink"
              >
                {locality.name}
                <span className="ml-1.5 text-xs text-ink-subtle">
                  {locality.activeListingCount}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
