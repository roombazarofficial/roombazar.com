"use client";

import { useRouter, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildSearchQuery } from "@/lib/utils/querystring";
import { roomTypeLabels, roomTypeOrder, furnishingLabels, postedByLabels } from "@/lib/constants/roomtypes";
import { routes } from "@/lib/constants/routes";
import type { SearchFilters } from "@/types/searchfilters";
import type { Locality } from "@/types/locality";
import type { Furnishing, PostedBy, RoomType } from "@/types/listing";

export function FilterPanel({
  filters,
  localities,
  citySlug,
  showClearButton = true,
}: {
  filters: SearchFilters;
  localities: Locality[];
  citySlug: string;
  /** The drawer supplies its own clear action in a pinned footer. */
  showClearButton?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(next: Partial<SearchFilters>) {
    const merged = { ...filters, ...next, page: 1 };
    router.push(`${pathname}${buildSearchQuery(merged)}`, { scroll: false });
  }

  function toggle<T extends string>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  return (
    <div className="space-y-7">
      {/*
        Owner-only sits at the top and on its own. It is the filter people
        come to this site for, and burying it under room type would waste the
        clearest reason to choose us over an incumbent portal.
      */}
      <Section title="Posted by">
        {(Object.keys(postedByLabels) as PostedBy[]).map((value) => (
          <Checkbox
            key={value}
            label={postedByLabels[value]}
            checked={filters.postedBy.includes(value)}
            onChange={() => apply({ postedBy: toggle(filters.postedBy, value) })}
          />
        ))}
      </Section>

      <Section title="Monthly rent">
        <div className="flex items-center gap-2 px-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            prefix="₹"
            defaultValue={
              filters.minRentPaise ? filters.minRentPaise / 100 : ""
            }
            onBlur={(event) =>
              apply({
                minRentPaise: event.target.value
                  ? Number(event.target.value) * 100
                  : null,
              })
            }
          />
          <span className="text-ink-subtle">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            prefix="₹"
            defaultValue={
              filters.maxRentPaise ? filters.maxRentPaise / 100 : ""
            }
            onBlur={(event) =>
              apply({
                maxRentPaise: event.target.value
                  ? Number(event.target.value) * 100
                  : null,
              })
            }
          />
        </div>
      </Section>

      <Section title="Locality">
        {localities.map((locality) => (
          <Checkbox
            key={locality.id}
            label={locality.name}
            count={locality.activeListingCount}
            checked={filters.localitySlugs.includes(locality.slug)}
            onChange={() =>
              apply({
                localitySlugs: toggle(filters.localitySlugs, locality.slug),
              })
            }
          />
        ))}
      </Section>

      <Section title="Room type">
        {roomTypeOrder.map((value: RoomType) => (
          <Checkbox
            key={value}
            label={roomTypeLabels[value]}
            checked={filters.roomTypes.includes(value)}
            onChange={() => apply({ roomTypes: toggle(filters.roomTypes, value) })}
          />
        ))}
      </Section>

      <Section title="Furnishing">
        {(Object.keys(furnishingLabels) as Furnishing[]).map((value) => (
          <Checkbox
            key={value}
            label={furnishingLabels[value]}
            checked={filters.furnishing.includes(value)}
            onChange={() =>
              apply({ furnishing: toggle(filters.furnishing, value) })
            }
          />
        ))}
      </Section>

      {showClearButton && (
        <Button
          variant="ghost"
          fullWidth
          onClick={() => router.push(routes.city(citySlug))}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1.5 px-2 text-sm font-semibold text-ink">{title}</h2>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}
