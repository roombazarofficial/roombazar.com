"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCities, fetchLocalities } from "@/lib/api/geography";
import type { City } from "@/types/city";
import type { Locality } from "@/types/locality";

export interface GeographyState {
  cities: City[];
  localities: Locality[];
  loadingCities: boolean;
  loadingLocalities: boolean;
  error: string | null;
  retry: () => void;
}

const UNREACHABLE =
  "Could not load the city list. Check your connection and try again.";

export function useLocalities(citySlug: string | null): GeographyState {
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoadingCities(true);

    fetchCities()
      .then((result) => {
        if (!active) return;
        setCities(result);
        setError(null);
      })
      .catch(() => {
        if (active) setError(UNREACHABLE);
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (!citySlug) {
      setLocalities([]);
      return;
    }

    let active = true;
    setLoadingLocalities(true);

    fetchLocalities(citySlug)
      .then((result) => {
        if (!active) return;
        setLocalities(result);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setLocalities([]);
          setError(UNREACHABLE);
        }
      })
      .finally(() => {
        if (active) setLoadingLocalities(false);
      });

    return () => {
      active = false;
    };
  }, [citySlug, attempt]);

  return {
    cities,
    localities,
    loadingCities,
    loadingLocalities,
    error,
    retry,
  };
}
