"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDistrictCities,
  fetchDistricts,
  fetchStates,
} from "@/lib/api/geography";
import type { State } from "@/types/state";
import type { District } from "@/types/district";
import type { Locality } from "@/types/locality";

const UNREACHABLE =
  "Could not load locations. Check your connection and try again.";

export function useIndiaLocations(
  stateCode: string | null,
  districtSlug: string | null,
) {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<Locality[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoadingStates(true);

    fetchStates()
      .then((result) => {
        if (!active) return;
        setStates(result);
        setError(null);
      })
      .catch(() => active && setError(UNREACHABLE))
      .finally(() => active && setLoadingStates(false));

    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (!stateCode) {
      setDistricts([]);
      return;
    }

    let active = true;
    setLoadingDistricts(true);

    fetchDistricts(stateCode)
      .then((result) => {
        if (!active) return;
        setDistricts(result);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setDistricts([]);
          setError(UNREACHABLE);
        }
      })
      .finally(() => active && setLoadingDistricts(false));

    return () => {
      active = false;
    };
  }, [stateCode, attempt]);

  useEffect(() => {
    if (!districtSlug) {
      setCities([]);
      return;
    }

    let active = true;
    setLoadingCities(true);

    fetchDistrictCities(districtSlug)
      .then((result) => {
        if (!active) return;
        setCities(result);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setCities([]);
          setError(UNREACHABLE);
        }
      })
      .finally(() => active && setLoadingCities(false));

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
