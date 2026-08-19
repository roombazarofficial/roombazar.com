"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocationPicker } from "./locationpicker";
import { buildSearchQuery } from "@/lib/utils/querystring";
import { routes } from "@/lib/constants/routes";
import type { Locality } from "@/types/locality";

export function HeroSearchBar({ localities }: { localities: Locality[] }) {
  const router = useRouter();

  const [selectedLocationLabel, setSelectedLocationLabel] = useState("");
  const [localitySlug, setLocalitySlug] = useState("");
  const [citySlug, setCitySlug] = useState("bengaluru");
  const [moveIn, setMoveIn] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const query = buildSearchQuery({
      localitySlugs: localitySlug ? [localitySlug] : [],
      availableFrom: moveIn || null,
    });

    router.push(`${routes.city(citySlug || "bengaluru")}${query}`);
  }

  return (
    <form
      onSubmit={submit}
      className="relative mx-auto mt-9 w-full max-w-2xl overflow-visible rounded-2xl border border-line bg-white shadow-md sm:rounded-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* =========================================================================
            1. LOCATION FIELD
            ========================================================================= */}
        <div className="relative min-w-0 flex-[1.4] px-5 py-3 sm:pl-6 sm:pr-4 text-left transition-colors hover:bg-surface-muted sm:rounded-l-full flex flex-col justify-center items-start">
          {/* Row 1: Label (aligned directly above the Select text) */}
          <label
            htmlFor="hero-where"
            className="block text-2xs font-bold uppercase tracking-wider text-ink leading-none text-left pl-[26px]"
          >
            LOCATION
          </label>

          {/* Row 2: Value Row (Icon + Text + Chevron) */}
          <div className="mt-2 flex h-5 w-full items-center text-left">
            <LocationPicker
              selectedLabel={selectedLocationLabel}
              localities={localities}
              onSelect={({ label, localitySlug: locSlug, citySlug: cSlug }) => {
                setSelectedLocationLabel(label);
                setLocalitySlug(locSlug || "");
                setCitySlug(cSlug || "bengaluru");
              }}
            />
          </div>
        </div>

        {/* Divider between Location and Move-in */}
        <div className="hidden sm:flex items-center self-center px-1">
          <span className="h-10 w-px bg-line" aria-hidden />
        </div>
        <span className="block sm:hidden h-px w-full bg-line" aria-hidden />

        {/* =========================================================================
            2. MOVE-IN DATE FIELD
            ========================================================================= */}
        <div className="relative min-w-0 flex-1 px-5 py-3 sm:px-5 text-left transition-colors hover:bg-surface-muted flex flex-col justify-center items-start cursor-pointer">
          {/* Row 1: Label */}
          <label
            htmlFor="hero-movein"
            className="block text-2xs font-bold uppercase tracking-wider text-ink leading-none text-left cursor-pointer"
          >
            MOVE-IN
          </label>

          {/* Row 2: Value Row (mm/dd/yyyy + Calendar Icon) */}
          <div className="mt-2 flex h-5 w-full items-center justify-between text-left">
            <span
              className={
                moveIn
                  ? "truncate text-sm font-semibold text-ink"
                  : "truncate text-sm font-normal text-ink-muted"
              }
            >
              {moveIn || "mm/dd/yyyy"}
            </span>

            {/* Calendar Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 shrink-0 text-ink-muted"
              aria-hidden
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>

          {/* Invisible date input for native picker triggering */}
          <input
            id="hero-movein"
            type="date"
            value={moveIn}
            onChange={(event) => setMoveIn(event.target.value)}
            className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
            aria-label="Move-in date"
          />
        </div>

        {/* =========================================================================
            3. SEARCH ACTION BUTTON
            ========================================================================= */}
        <div className="p-2 sm:pr-2.5 flex items-center">
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-[0.98] sm:h-11 sm:w-auto"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span>Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
