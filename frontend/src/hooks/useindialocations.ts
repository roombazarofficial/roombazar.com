"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDistrictCities,
  fetchDistricts,
  fetchStates,
} from "@/lib/api/geography";
import {
  ALL_INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CITIES_BY_DISTRICT,
} from "@/lib/constants/indiaLocations";
import type { State } from "@/types/state";
import type { District } from "@/types/district";
import type { Locality } from "@/types/locality";

export function useIndiaLocations(
  stateCode: string | null,
  districtSlug: string | null,
) {
  const [states, setStates] = useState<State[]>(ALL_INDIAN_STATES);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<Locality[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  // 1. Load States (API + Fallback to all Indian states)
  useEffect(() => {
    let active = true;

    fetchStates()
      .then((result) => {
        if (!active) return;
        // Merge API states with full standard list
        const existingCodes = new Set(result.map((s) => s.code));
        const combined = [
          ...result,
          ...ALL_INDIAN_STATES.filter((s) => !existingCodes.has(s.code)),
        ].sort((a, b) => a.name.localeCompare(b.name));

        setStates(combined);
        setError(null);
      })
      .catch(() => {
        // Fallback gracefully to full states list on offline or empty
        if (active) {
          setStates(ALL_INDIAN_STATES);
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  // 2. Load Districts for Selected State
  useEffect(() => {
    if (!stateCode) {
      setDistricts([]);
      return;
    }

    let active = true;
    const staticDistricts = DISTRICTS_BY_STATE[stateCode] || [];
    setDistricts(staticDistricts);

    fetchDistricts(stateCode)
      .then((result) => {
        if (!active) return;
        const existingSlugs = new Set(result.map((d) => d.slug));
        const combined = [
          ...result,
          ...staticDistricts.filter((d) => !existingSlugs.has(d.slug)),
        ].sort((a, b) => a.name.localeCompare(b.name));

        setDistricts(combined.length > 0 ? combined : staticDistricts);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setDistricts(staticDistricts);
        }
      });

    return () => {
      active = false;
    };
  }, [stateCode, attempt]);

  // 3. Load Cities / Localities for Selected District
  useEffect(() => {
    if (!districtSlug) {
      setCities([]);
      return;
    }

    let active = true;
    const staticLocalities = CITIES_BY_DISTRICT[districtSlug] || [];

    // If no explicit localities, provide the district itself as the primary locality option
    const defaultLocalities: Locality[] =
      staticLocalities.length > 0
        ? staticLocalities
        : [
            {
              id: `loc-${districtSlug}`,
              name: districtSlug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
              slug: districtSlug,
              cityId: districtSlug,
              citySlug: districtSlug,
              aliases: [],
              activeListingCount: 1,
              medianRentPaise: null,
            },
          ];

    setCities(defaultLocalities);

    fetchDistrictCities(districtSlug)
      .then((result) => {
        if (!active) return;
        const existingSlugs = new Set(result.map((c) => c.slug));
        const combined = [
          ...result,
          ...staticLocalities.filter((c) => !existingSlugs.has(c.slug)),
        ].sort((a, b) => a.name.localeCompare(b.name));

        setCities(combined.length > 0 ? combined : defaultLocalities);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setCities(defaultLocalities);
        }
      });

    return () => {
      active = false;
    };
  }, [districtSlug, attempt]);

  return {
    states,
    districts,
    cities,
    loadingStates,
    loadingDistricts,
    loadingCities,
    error,
    retry,
  };
}
