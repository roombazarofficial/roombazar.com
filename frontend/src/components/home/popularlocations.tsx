"use client";

import Link from "next/link";
import { useRef } from "react";
import { routes } from "@/lib/constants/routes";

interface Location {
  cityName: string;
  citySlug: string;
  localityName: string;
  localitySlug: string;
}

export function PopularLocations({ locations }: { locations: Location[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  function scroll(direction: "previous" | "next") {
    scroller.current?.scrollBy({
      left: direction === "next" ? 240 : -240,
      behavior: "smooth",
    });
  }

  if (!locations.length) return null;

  return (
    <>
      {/* Scroll controls */}
      <div className="flex items-center gap-1.5 mb-3.5">
        <button
          type="button"
          aria-label="Previous localities"
          onClick={() => scroll("previous")}
          className="flex size-8 items-center justify-center rounded-full border border-line bg-white text-ink-muted shadow-card transition-all hover:border-line-strong hover:text-ink hover:shadow-raised active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next localities"
          onClick={() => scroll("next")}
          className="flex size-8 items-center justify-center rounded-full border border-line bg-white text-ink-muted shadow-card transition-all hover:border-line-strong hover:text-ink hover:shadow-raised active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scroller}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
      >
        {locations.map((location, i) => (
          <Link
            key={`${location.citySlug}/${location.localitySlug}`}
            href={routes.locality(location.citySlug, location.localitySlug)}
            className={`
              group min-w-[11rem] flex-1 rounded-xl border border-line bg-white
              p-4 transition-all duration-200
              hover:border-brand-300 hover:shadow-raised hover:-translate-y-0.5
              animate-fade-up stagger-${Math.min(i + 1, 6)}
            `}
          >
            {/* Icon */}
            <div className="mb-2.5 flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="text-sm font-bold text-ink group-hover:text-brand-700 transition-colors">
              {location.localityName}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {location.cityName}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
