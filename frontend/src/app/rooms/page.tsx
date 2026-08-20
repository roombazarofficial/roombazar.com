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
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Rooms for rent across India
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {results.totalItems} {results.totalItems === 1 ? "room" : "rooms"}{" "}
            available now
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
                description="Try clearing a filter. New rooms are posted every day."
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
