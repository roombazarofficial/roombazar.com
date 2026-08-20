"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { useIndiaLocations } from "@/hooks/useindialocations";
import { routes } from "@/lib/constants/routes";
import { buildSearchQuery } from "@/lib/utils/querystring";
import type { SearchFilters } from "@/types/searchfilters";

export function LocationHierarchyFilter({
  filters,
  initialStateName,
  initialDistrictSlug,
  initialCitySlug,
}: {
  filters: SearchFilters;
  initialStateName?: string;
  initialDistrictSlug?: string;
  initialCitySlug?: string;
}) {
  const router = useRouter();
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [districtSlug, setDistrictSlug] = useState<string | null>(
    initialDistrictSlug ?? null,
  );
  const [citySlug, setCitySlug] = useState<string | null>(
    initialCitySlug ?? null,
  );
  const {
    states,
    districts,
    cities,
    loadingStates,
    loadingDistricts,
    loadingCities,
  } = useIndiaLocations(stateCode, districtSlug);

  useEffect(() => {
    if (stateCode || !initialStateName || states.length === 0) return;
    const state = states.find((item) => item.name === initialStateName);
    if (state) setStateCode(state.code);
  }, [initialStateName, stateCode, states]);

  const query = buildSearchQuery({
    ...filters,
    citySlug: "",
    localitySlugs: [],
    page: 1,
  });

  return (
    <section>
      <h2 className="mb-2 px-2 text-sm font-semibold text-ink">Location</h2>
      <div className="space-y-3 px-2">
        <Select
          label="State"
          placeholder={loadingStates ? "Loading states..." : "All states"}
          options={states.map((state) => ({
            value: state.code,
            label: state.name,
          }))}
          value={stateCode ?? ""}
          disabled={loadingStates}
          onChange={(event) => {
            setStateCode(event.target.value);
            setDistrictSlug(null);
            setCitySlug(null);
          }}
        />

        <Select
          label="District"
          placeholder={
            !stateCode
              ? "Choose a state first"
              : loadingDistricts
                ? "Loading districts..."
                : "All districts"
          }
          options={districts.map((district) => ({
            value: district.slug,
            label: district.name,
          }))}
          value={districtSlug ?? ""}
          disabled={!stateCode || loadingDistricts}
          onChange={(event) => {
            const value = event.target.value;
            setDistrictSlug(value);
            setCitySlug(null);
            router.push(`${routes.city(value)}${query}`);
          }}
        />

        <Select
          label="City"
          placeholder={
            !districtSlug
              ? "Choose a district first"
              : loadingCities
                ? "Loading cities..."
                : "All cities"
          }
          options={cities.map((city) => ({
            value: city.slug,
            label: city.name,
          }))}
          value={citySlug ?? ""}
          disabled={!districtSlug || loadingCities}
          onChange={(event) => {
            if (!districtSlug) return;
            const value = event.target.value;
            setCitySlug(value);
            router.push(`${routes.locality(districtSlug, value)}${query}`);
          }}
        />
      </div>
    </section>
  );
}
