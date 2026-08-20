"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { City } from "@/types/city";

type Selection = { label: string; citySlug?: string };

export function LocationPicker({
  selectedLabel,
  onSelect,
  cities,
}: {
  selectedLabel: string;
  onSelect: (item: Selection) => void;
  cities: City[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const visibleCities = useMemo(() => {
    const needle = normalise(query);
    const ordered = [...cities].sort((a, b) => a.name.localeCompare(b.name));
    if (!needle) return ordered.slice(0, 8);
    return ordered
      .filter((city) => normalise(`${city.name} ${city.state}`).includes(needle))
      .slice(0, 12);
  }, [cities, query]);

  function chooseCity(city: City) {
    onSelect({ label: `${city.name}, ${city.state}`, citySlug: city.slug });
    setQuery("");
    setIsOpen(false);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const result = await response.json();
          const detectedName =
            result.address?.city ??
            result.address?.town ??
            result.address?.state_district ??
            result.address?.county;
          const detectedState = result.address?.state;
          const match = cities.find((city) => {
            const cityName = normalise(city.name);
            return (
              cityName === normalise(detectedName ?? "") ||
              cityName === normalise(result.address?.state_district ?? "")
            );
          });

          if (match) chooseCity(match);
          else {
            onSelect({
              label: [detectedName, detectedState].filter(Boolean).join(", ") || "India",
            });
            setIsOpen(false);
          }
        } catch {
          onSelect({ label: "India" });
          setIsOpen(false);
        } finally {
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { timeout: 8000, enableHighAccuracy: true },
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-5 w-full items-center justify-between gap-2 text-left outline-none"
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <LocationIcon className="size-4 shrink-0 text-brand-600" />
          <span className={selectedLabel ? "truncate text-sm font-semibold text-ink" : "truncate text-sm text-ink-muted"}>
            {selectedLabel || "Select location"}
          </span>
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`size-4 shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-100 mt-3.5 w-full min-w-72 rounded-2xl border border-line bg-white p-3 text-left shadow-2xl ring-1 ring-black/5">
          <button type="button" onClick={useCurrentLocation} disabled={detecting} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-60">
            <LocationIcon className="size-5 shrink-0" />
            {detecting ? "Detecting location…" : "Use current location"}
          </button>

          <button type="button" onClick={() => { onSelect({ label: "India" }); setIsOpen(false); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-muted">
            <LocationIcon className="size-5 shrink-0 text-ink-muted" />
            All India
          </button>

          <div className="my-2 border-t border-line" />
          <label className="sr-only" htmlFor="location-search">Search cities</label>
          <input id="location-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city or state" autoFocus className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink outline-none focus:border-brand-600" />

          <p className="px-3 pb-1 pt-3 text-2xs font-bold uppercase tracking-wider text-ink-muted">
            {query ? "Matching locations" : "Available locations"}
          </p>
          <div className="max-h-64 overflow-y-auto">
            {visibleCities.map((city) => (
              <button key={city.id} type="button" onClick={() => chooseCity(city)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-muted">
                <LocationIcon className="size-5 shrink-0 text-ink-muted" />
                <span className="min-w-0 truncate text-sm font-medium text-ink">
                  {city.name}<span className="ml-1.5 text-xs font-normal text-ink-muted">· {city.state}</span>
                </span>
              </button>
            ))}
            {visibleCities.length === 0 && <p className="px-3 py-4 text-sm text-ink-muted">No matching city found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function LocationIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
    </svg>
  );
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
