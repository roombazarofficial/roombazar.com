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
  CityStructuredData,
  BreadcrumbStructuredData,
} from "@/components/common/structureddata";
import { FaqSection } from "@/components/common/faqsection";
import { searchListings } from "@/lib/api/listings";
import { getCityBySlug, getLocalities } from "@/lib/api/geography";
import { parseSearchParams, buildSearchQuery } from "@/lib/utils/querystring";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ city: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const { city } = await params;
  const rawSearch = await searchParams;
  const found = await getCityBySlug(city);
  if (!found) return {};

  const title = `Rooms for Rent in ${found.name} — Direct From Owners | RoomBazar`;
  const description = `Find verified single rooms, shared rooms, 1 BHK, 2 BHK, and flats for rent in ${found.name}, posted directly by owners with zero broker fees.`;
  const hasFilterParams = Object.keys(rawSearch).length > 0;

  return {
    title,
    description,
    alternates: { canonical: routes.city(city) },
    openGraph: {
      title,
      description,
      url: routes.city(city),
      siteName: "RoomBazar",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: hasFilterParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
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
  const found = await getCityBySlug(city);
  if (!found) notFound();

  const filters = parseSearchParams(await searchParams, city);

  const [results, localities] = await Promise.all([
    searchListings({ ...filters, citySlug: city }),
    getLocalities(city),
  ]);

  const faqItems =
    results.totalItems > 0
      ? [
          {
            question: `How many rooms are available for rent in ${found.name}?`,
            answer: `${results.totalItems} ${
              results.totalItems === 1 ? "room is" : "rooms are"
            } listed for rent in ${found.name} on RoomBazar right now, each posted directly by the owner or an existing tenant.`,
          },
          {
            question: "Is there any brokerage or commission on RoomBazar?",
            answer: `No. Rooms in ${found.name} are listed directly by owners and tenants, so you deal with them directly and pay no broker fee.`,
          },
          {
            question: `How do I contact a room owner in ${found.name}?`,
            answer:
              "Open any room and start a chat from the listing page. Phone numbers stay private until both you and the owner agree to share them.",
          },
        ]
      : [];

  return (
    <SiteShell>
      <CityStructuredData
        cityName={found.name}
        citySlug={city}
        listingCount={results.totalItems}
      />
      <BreadcrumbStructuredData
        trail={[
          { name: "Home", path: routes.home },
          { name: `Rooms in ${found.name}`, path: routes.city(city) },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Rooms for rent in {found.name}
          </h1>

          <p className="mt-1 text-sm text-ink-muted">
            {results.totalItems}{" "}
            {results.totalItems === 1 ? "room" : "rooms"} available now
          </p>

        </header>

        <div className="mt-8 flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterPanel
              filters={filters}
              citySlug={city}
              stateName={found.state}
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
                  stateName={found.state}
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
                  <Link
                    href={routes.city(city)}
                    className={buttonStyles({ variant: "secondary" })}
                  >
                    Clear all filters
                  </Link>

                }
              />

            )}
          </div>

        </div>

        {localities.length > 0 && (
          <section className="mt-14 border-t border-line pt-8">
            <h2 className="text-base font-semibold text-ink">
              Browse by locality
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {localities
                .filter((locality) => locality.activeListingCount > 0)
                .slice(0, 20)
                .map((locality) => (
                <Link
                  key={locality.id}
                  href={routes.locality(city, locality.slug)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-line-strong hover:text-ink"
                >
                  {locality.name}
                </Link>

              ))}
            </div>

          </section>

        )}

        <FaqSection items={faqItems} />
      </div>

    </SiteShell>

  );
}
