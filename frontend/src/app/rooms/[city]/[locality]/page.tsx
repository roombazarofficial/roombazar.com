import { notFound } from "next/navigation";
import Link from "next/link";
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
import {
  LocalityStructuredData,
  BreadcrumbStructuredData,
} from "@/components/common/structureddata";
import { searchListings } from "@/lib/api/listings";
import { getCityBySlug, getLocalities } from "@/lib/api/geography";
import { parseSearchParams, buildSearchQuery } from "@/lib/utils/querystring";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ city: string; locality: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { city, locality } = await params;
  const [foundCity, localities] = await Promise.all([
    getCityBySlug(city),
    getLocalities(city),
  ]);

  const found = localities.find((item) => item.slug === locality);
  if (!foundCity || !found) return {};

  return {
    title: `Rooms for rent in ${found.name}, ${foundCity.name}`,
    description: `Rooms and PGs for rent in ${found.name}, ${foundCity.name}, posted directly by owners. No broker fees.`,
    alternates: { canonical: routes.locality(city, locality) },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { city, locality: localitySlug } = await params;

  const [foundCity, localities] = await Promise.all([
    getCityBySlug(city),
    getLocalities(city),
  ]);

  const locality = localities.find((item) => item.slug === localitySlug);
  if (!foundCity || !locality) notFound();

  const parsed = parseSearchParams(await searchParams, city);
  const filters = { ...parsed, localitySlugs: [localitySlug] };
  const results = await searchListings({ ...filters, citySlug: city });

  const nearby = localities
    .filter(
      (item) =>
        item.slug !== localitySlug && item.activeListingCount > 0,
    )
    .slice(0, 20);

  return (
    <SiteShell>
      <LocalityStructuredData
        locality={locality}
        cityName={foundCity.name}
        listingCount={results.totalItems}
      />

      <BreadcrumbStructuredData
        trail={[
          { name: foundCity.name, path: routes.city(city) },
          { name: locality.name, path: routes.locality(city, localitySlug) },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-ink-muted">
          <Link href={routes.city(city)} className="hover:text-ink">
            {foundCity.name}
          </Link>

          <span className="mx-1.5">/</span>
          <span className="text-ink">{locality.name}</span>

        </nav>

        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Rooms for rent in {locality.name}
          </h1>

          <p className="mt-1.5 text-sm text-ink-muted">
            {results.totalItems} {results.totalItems === 1 ? "room" : "rooms"}{" "}
            available in {locality.name}, {foundCity.name}
            {locality.medianRentPaise
              ? ` · median rent ${formatRupees(locality.medianRentPaise)}/month`
              : ""}
          </p>

        </header>

        <div className="mt-8 flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterPanel
              filters={filters}
              citySlug={city}
              stateName={foundCity.state}
              selectedCitySlug={localitySlug}
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
                  citySlug={city}
                  stateName={foundCity.state}
                  selectedCitySlug={localitySlug}
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
                    `${routes.locality(city, localitySlug)}${buildSearchQuery({ ...filters, page })}`
                  }
                />

              </>

            ) : (
              <EmptyState
                title={`No rooms in ${locality.name} match these filters`}
                description="Try widening your rent range, or look at a nearby locality."
                action={
                  <Link
                    href={routes.city(city)}
                    className={buttonStyles({ variant: "secondary" })}
                  >
                    Search all of {foundCity.name}
                  </Link>

                }
              />

            )}
          </div>

        </div>

        {nearby.length > 0 && (
          <section className="mt-14 border-t border-line pt-8">
            <h2 className="text-base font-semibold text-ink">
              Nearby localities
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {nearby.map((item) => (
                <Link
                  key={item.id}
                  href={routes.locality(city, item.slug)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-line-strong hover:text-ink"
                >
                  {item.name}
                </Link>

              ))}
            </div>

          </section>

        )}
      </div>

    </SiteShell>

  );
}
