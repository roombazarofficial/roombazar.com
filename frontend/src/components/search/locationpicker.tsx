"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { City } from "@/types/city";

type Selection = { label: string; citySlug?: string };

export function LocationPicker({
  selectedLabel,
  onSelect,
  cities,
  isOpen,
  onToggle,
  onClose,
}: {
  selectedLabel: string;
  onSelect: (item: Selection) => void;
  cities: City[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input when opened on desktop
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const visibleCities = useMemo(() => {
    const needle = normalise(query);
    const ordered = [...cities].sort((a, b) => a.name.localeCompare(b.name));
    if (!needle) return ordered.slice(0, 8);
    return ordered
      .filter((city) =>
        normalise(`${city.name} ${city.state}`).includes(needle),
      )
      .slice(0, 12);
  }, [cities, query]);

  function chooseCity(city: City) {
    onSelect({ label: `${city.name}, ${city.state}`, citySlug: city.slug });
    setQuery("");
    onClose();
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

          if (match) {
            chooseCity(match);
          } else {
            onSelect({
              label:
                [detectedName, detectedState].filter(Boolean).join(", ") ||
                "India",
            });
            onClose();
          }
        } catch {
          onSelect({ label: "India" });
          onClose();
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
      {/* Trigger Value Row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 text-left cursor-pointer outline-none"
        aria-expanded={isOpen}
        aria-label="Select location"
      >
        <span
          className={
            selectedLabel
              ? "truncate text-sm font-semibold text-ink"
              : "truncate text-sm font-normal text-ink-muted"
          }
        >
          {selectedLabel || "Search city, state or area"}
        </span>

        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-4 shrink-0 text-ink-subtle transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-600" : ""
          }`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="
            absolute left-0 top-[calc(100%+14px)] z-50
            w-[calc(100vw-32px)] max-w-[360px] sm:w-[380px]
            rounded-2xl border border-line bg-white p-3 text-left
            shadow-overlay ring-1 ring-black/[0.04]
            animate-in fade-in zoom-in-95 duration-150
          "
        >
          {/* Quick Actions: Current Location & All India */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={detecting}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="22" y1="12" x2="18" y2="12" />
                <line x1="6" y1="12" x2="2" y2="12" />
                <line x1="12" y1="6" x2="12" y2="2" />
                <line x1="12" y1="22" x2="12" y2="18" />
              </svg>
              <span>
                {detecting ? "Detecting location…" : "Use current location"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelect({ label: "All India" });
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-ink hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0 text-ink-muted"
                aria-hidden
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>All India</span>
            </button>
          </div>

          <div className="my-2 border-t border-line" />

          {/* Search input */}
          <div className="relative">
            <input
              ref={searchInputRef}
              id="location-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or state…"
              className="h-10 w-full rounded-xl border border-line bg-surface-muted/40 px-3 pl-8 text-xs sm:text-sm text-ink outline-none transition-colors focus:border-brand-600 focus:bg-white"
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-muted pointer-events-none"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>

          {/* City list */}
          <div className="mt-2">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
              {query ? "Matching Locations" : "Available Locations"}
            </p>
            <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
              {visibleCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => chooseCity(city)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5 shrink-0 text-ink-subtle"
                    aria-hidden
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="min-w-0 truncate text-xs sm:text-sm font-medium text-ink">
                    {city.name}
                    <span className="ml-1 text-[11px] font-normal text-ink-muted">
                      · {city.state}
                    </span>
                  </span>
                </button>
              ))}

              {visibleCities.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-ink-muted">
                  No matching city found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
