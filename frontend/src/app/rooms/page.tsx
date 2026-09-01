import type { Metadata } from "next";
import Link from "next/link";
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
import { parseSearchParams, buildSearchQuery } from "@/lib/utils/querystring";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Browse rooms for rent",
  description:
    "Rooms, PGs, flats and hostel beds for rent across India, posted directly by owners.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: Search }) {
  const filters = parseSearchParams(await searchParams, "");
  const results = await searchListings(filters);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header>
          <p className="text-2xs font-bold uppercase tracking-widest text-brand-600">
            Browse spaces
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Rooms for rent across India
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {results.totalItems}{" "}
            {results.totalItems === 1 ? "room" : "rooms"} available right now
          </p>
        </header>

        <div className="mt-8 flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterPanel filters={filters} citySlug="" />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="hidden text-sm text-ink-muted sm:block">
                Showing {results.items.length} of {results.totalItems}
              </p>
              <div className="flex items-center gap-2">
                <FilterDrawer filters={filters} citySlug="" />
                <SortSelect current={filters.sort} />
              </div>
            </div>

            <ActiveFilterChips filters={filters} localities={[]} />

            {results.items.length > 0 ? (
              <>
                <ListingGrid listings={results.items} />
                <Pagination
                  page={results.page}
                  totalPages={results.totalPages}
                  buildHref={(page) =>
                    `${routes.rooms}${buildSearchQuery({ ...filters, page })}`
                  }
                />
              </>
            ) : (
              <EmptyState
                title="No rooms match these filters"
                description="Try clearing a filter or widening your search. New rooms are posted every day."
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-7">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                }
                action={
                  <Link
                    href={routes.rooms}
                    className={buttonStyles({ variant: "secondary" })}
                  >
                    Clear all filters
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
