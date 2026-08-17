"use client";

import { useRouter, usePathname } from "next/navigation";
import { buildSearchQuery } from "@/lib/utils/querystring";
import { roomTypeLabels, furnishingLabels, postedByLabels } from "@/lib/constants/roomtypes";
import { formatRupees } from "@/lib/format/rupees";
import type { SearchFilters } from "@/types/searchfilters";
import type { Locality } from "@/types/locality";

interface Chip {
  label: string;
  remove: Partial<SearchFilters>;
}

/**
 * Makes the active filters visible above the results and removable in one
 * tap. On mobile the filter UI is behind a drawer, so without this a seeker
 * can end up staring at three results with no idea which filter caused it.
 */
export function ActiveFilterChips({
  filters,
  localities,
}: {
  filters: SearchFilters;
  localities: Locality[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const chips: Chip[] = [];

  filters.localitySlugs.forEach((slug) => {
    const locality = localities.find((item) => item.slug === slug);
    chips.push({
      label: locality?.name ?? slug,
      remove: {
        localitySlugs: filters.localitySlugs.filter((item) => item !== slug),
      },
    });
  });

  filters.roomTypes.forEach((type) => {
    chips.push({
      label: roomTypeLabels[type],
      remove: { roomTypes: filters.roomTypes.filter((item) => item !== type) },
    });
  });

  filters.furnishing.forEach((value) => {
    chips.push({
      label: furnishingLabels[value],
      remove: { furnishing: filters.furnishing.filter((item) => item !== value) },
    });
  });

  filters.postedBy.forEach((value) => {
    chips.push({
      label: postedByLabels[value],
      remove: { postedBy: filters.postedBy.filter((item) => item !== value) },
    });
  });

  if (filters.minRentPaise != null) {
    chips.push({
      label: `Above ${formatRupees(filters.minRentPaise)}`,
      remove: { minRentPaise: null },
    });
  }

  if (filters.maxRentPaise != null) {
    chips.push({
      label: `Under ${formatRupees(filters.maxRentPaise)}`,
      remove: { maxRentPaise: null },
    });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="mb-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.label}>
          <button
            type="button"
            onClick={() =>
              router.push(
                `${pathname}${buildSearchQuery({ ...filters, ...chip.remove, page: 1 })}`,
                { scroll: false },
              )
            }
            className="flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pl-3 pr-2 text-sm text-brand-700 hover:bg-brand-100"
          >
            {chip.label}
            <span aria-hidden className="text-base leading-none">×</span>
            <span className="sr-only">Remove filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
