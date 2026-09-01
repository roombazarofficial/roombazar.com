"use client";

import { useState } from "react";
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
  const [focused, setFocused] = useState<"location" | "movein" | null>(null);

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
        relative mx-auto mt-8 w-full max-w-3xl overflow-visible
        rounded-2xl border bg-white shadow-raised
        transition-all duration-200
        sm:rounded-full
        ${focused
          ? "border-brand-400 shadow-feature"
          : "border-line hover:border-line-strong hover:shadow-overlay"
        }
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* =========================================================================
            1. LOCATION FIELD
            ========================================================================= */}
        <div
          className={`
            relative min-w-0 flex-[1.5] px-5 py-3.5 sm:pl-6 sm:pr-4 text-left
            flex flex-col justify-center items-start cursor-pointer
            rounded-t-2xl sm:rounded-l-full sm:rounded-tr-none
            transition-colors duration-150
            ${focused === "location" ? "bg-brand-50/60" : "hover:bg-surface-muted/70"}
          `}
          onClick={() => setFocused("location")}
        >
          {/* Location icon + label row */}
          <div className="flex items-center gap-2 mb-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 shrink-0 text-brand-600"
              aria-hidden
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <label
              htmlFor="hero-where"
              className="block text-[11px] font-bold uppercase tracking-widest text-ink cursor-pointer"
            >
              Location
            </label>
          </div>

          {/* Value row */}
          <div className="flex h-5 w-full items-center text-left">
            <LocationPicker
              selectedLabel={selectedLocationLabel}
              cities={cities}
              onSelect={({ label, citySlug: cSlug }) => {
                setSelectedLocationLabel(label);
                setCitySlug(cSlug || "");
                setFocused(null);
              }}
            />
          </div>
        </div>

        {/* Dividers */}
        <div className="hidden sm:flex items-center self-center px-1">
          <span className="h-10 w-px bg-line" aria-hidden />
        </div>
        <span className="block sm:hidden h-px w-full bg-line" aria-hidden />

        {/* =========================================================================
            2. MOVE-IN DATE FIELD
            ========================================================================= */}
        <div
          className={`
            relative min-w-0 flex-1 px-5 py-3.5 sm:px-5 text-left
            flex flex-col justify-center items-start cursor-pointer
            transition-colors duration-150
            ${focused === "movein" ? "bg-brand-50/60" : "hover:bg-surface-muted/70"}
          `}
        >
          {/* Calendar icon + label row */}
          <div className="flex items-center gap-2 mb-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 shrink-0 text-brand-600"
              aria-hidden
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <label
              htmlFor="hero-movein"
              className="block text-[11px] font-bold uppercase tracking-widest text-ink cursor-pointer"
            >
              Move-in
            </label>
          </div>

          {/* Value row */}
          <div className="flex h-5 w-full items-center justify-between text-left">
            <span
              className={
                moveIn
                  ? "truncate text-sm font-semibold text-ink"
                  : "truncate text-sm font-normal text-ink-subtle"
              }
            >
              {moveIn ? new Date(moveIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Any time"}
            </span>
          </div>

          {/* Invisible date input */}
          <input
            id="hero-movein"
            type="date"
            value={moveIn}
            onFocus={() => setFocused("movein")}
            onBlur={() => setFocused(null)}
            onChange={(event) => setMoveIn(event.target.value)}
            className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
            aria-label="Move-in date"
          />
        </div>

        {/* =========================================================================
            3. SEARCH ACTION BUTTON
            ========================================================================= */}
        <div className="p-2.5 sm:pr-3 flex items-center">
          <button
            type="submit"
            className="
              flex h-12 w-full items-center justify-center gap-2
              rounded-xl sm:rounded-full
              bg-brand-600 px-8
              text-sm font-bold text-white
              shadow-raised
              transition-all duration-200
              hover:bg-brand-700 hover:-translate-y-px hover:shadow-card-hover
              active:scale-[0.97] active:translate-y-0
              sm:h-12 sm:w-auto
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
