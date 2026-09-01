"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LocationPicker } from "./locationpicker";
import { buildSearchQuery } from "@/lib/utils/querystring";
import { routes } from "@/lib/constants/routes";
import type { City } from "@/types/city";

export function HeroSearchBar({ cities }: { cities: City[] }) {
  const router = useRouter();

  const [selectedLocationLabel, setSelectedLocationLabel] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const query = buildSearchQuery({
      availableFrom: moveIn || null,
    });

    const destination = citySlug ? routes.city(citySlug) : routes.rooms;
    router.push(`${destination}${query}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`
        relative mx-auto mt-6 w-full max-w-3xl
        rounded-2xl sm:rounded-full
        border border-line bg-white shadow-raised
        transition-all duration-200
        ${isLocationOpen ? "ring-2 ring-brand-500/20 border-brand-300" : "hover:border-line-strong hover:shadow-overlay"}
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-center">
        {/* =========================================================================
            1. LOCATION SEGMENT
            ========================================================================= */}
        <div
          className={`
            relative min-w-0 flex-[1.4] px-4 py-3 sm:px-6
            flex flex-col justify-center items-start text-left cursor-pointer
            rounded-t-2xl sm:rounded-l-full sm:rounded-tr-none
            transition-colors duration-150
            ${isLocationOpen ? "bg-brand-50/40" : "hover:bg-surface-muted/60"}
          `}
        >
          <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-0.5 cursor-pointer">
            Location
          </label>

          <LocationPicker
            selectedLabel={selectedLocationLabel}
            cities={cities}
            isOpen={isLocationOpen}
            onToggle={() => setIsLocationOpen((prev) => !prev)}
            onClose={() => setIsLocationOpen(false)}
            onSelect={({ label, citySlug: cSlug }) => {
              setSelectedLocationLabel(label);
              setCitySlug(cSlug || "");
              setIsLocationOpen(false);
            }}
          />
        </div>

        {/* Divider (Desktop) */}
        <div className="hidden sm:block h-8 w-px bg-line shrink-0" aria-hidden />
        {/* Divider (Mobile) */}
        <div className="block sm:hidden h-px w-full bg-line" aria-hidden />

        {/* =========================================================================
            2. MOVE-IN DATE SEGMENT
            ========================================================================= */}
        <div
          onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
          className="
            relative min-w-0 flex-1 px-4 py-3 sm:px-6
            flex flex-col justify-center items-start text-left cursor-pointer
            hover:bg-surface-muted/60 transition-colors duration-150
          "
        >
          <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-0.5 cursor-pointer">
            Move-in
          </label>

          <div className="flex h-5 w-full items-center justify-between">
            <span
              className={
                moveIn
                  ? "truncate text-sm font-semibold text-ink"
                  : "truncate text-sm font-normal text-ink-muted"
              }
            >
              {moveIn
                ? new Date(moveIn).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Add dates"}
            </span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 shrink-0 text-ink-subtle"
              aria-hidden
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>

          {/* Invisible date picker input overlay */}
          <input
            ref={dateInputRef}
            id="hero-movein"
            type="date"
            value={moveIn}
            onChange={(e) => setMoveIn(e.target.value)}
            className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
            aria-label="Select move-in date"
          />
        </div>

        {/* =========================================================================
            3. SEARCH ACTION BUTTON
            ========================================================================= */}
        <div className="p-2 sm:pr-2.5 flex items-center">
          <button
            type="submit"
            className="
              flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-2
              rounded-xl sm:rounded-full bg-brand-600 px-7 sm:px-8
              text-sm font-bold text-white shadow-xs
              transition-all duration-150 hover:bg-brand-700 active:scale-[0.98]
              cursor-pointer
            "
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
