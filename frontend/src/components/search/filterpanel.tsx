"use client";

import { useRouter, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationHierarchyFilter } from "./locationhierarchyfilter";
import { buildSearchQuery } from "@/lib/utils/querystring";
import { roomTypeLabels, roomTypeOrder, furnishingLabels, postedByLabels } from "@/lib/constants/roomtypes";
import { routes } from "@/lib/constants/routes";
import type { SearchFilters } from "@/types/searchfilters";
import type { Furnishing, PostedBy, RoomType } from "@/types/listing";

export function FilterPanel({
  filters,
  citySlug,
  stateName,
  selectedCitySlug,
  showClearButton = true,
}: {
  filters: SearchFilters;
  citySlug: string;
  stateName?: string;
  selectedCitySlug?: string;
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
      <LocationHierarchyFilter
        filters={filters}
        initialStateName={stateName}
        initialDistrictSlug={citySlug || undefined}
        initialCitySlug={selectedCitySlug}
      />

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
          onClick={() =>
            router.push(citySlug ? routes.city(citySlug) : routes.rooms)
          }
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
