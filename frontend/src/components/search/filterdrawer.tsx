"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "./filterpanel";
import { routes } from "@/lib/constants/routes";
import type { SearchFilters } from "@/types/searchfilters";

export function FilterDrawer({
  filters,
  citySlug,
  stateName,
  selectedCitySlug,
}: {
  filters: SearchFilters;
  citySlug: string;
  stateName?: string;
  selectedCitySlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const activeCount =
    filters.localitySlugs.length +
    filters.roomTypes.length +
    filters.furnishing.length +
    filters.postedBy.length +
    filters.amenitySlugs.length +
    (filters.minRentPaise != null ? 1 : 0) +
    (filters.maxRentPaise != null ? 1 : 0);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        Filters
        {activeCount > 0 && (
          <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-2xs font-semibold text-ink-inverse">
            {activeCount}
          </span>

        )}
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                router.push(citySlug ? routes.city(citySlug) : routes.rooms);
                setOpen(false);
              }}
            >
              Clear all
            </Button>

            <Button fullWidth onClick={() => setOpen(false)}>
              Show results
            </Button>

          </div>

        }
      >
        {}
        <FilterPanel
          filters={filters}
          citySlug={citySlug}
          stateName={stateName}
          selectedCitySlug={selectedCitySlug}
          showClearButton={false}
        />

      </Drawer>

    </>

  );
}
