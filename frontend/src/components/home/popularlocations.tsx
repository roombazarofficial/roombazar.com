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
      left: direction === "next" ? 280 : -280,
      behavior: "smooth",
    });
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous localities"
          onClick={() => scroll("previous")}
          className="flex size-7 items-center justify-center rounded-full border border-line bg-white text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next localities"
          onClick={() => scroll("next")}
          className="flex size-7 items-center justify-center rounded-full border border-line bg-white text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div ref={scroller} className="mt-3.5 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {locations.map((location) => (
          <Link
            key={`${location.citySlug}/${location.localitySlug}`}
            href={routes.locality(location.citySlug, location.localitySlug)}
            className="min-w-[10.5rem] flex-1 rounded-xl border border-line bg-white p-3.5 transition-all hover:border-line-strong hover:shadow-xs"
          >
            <p className="text-xs font-bold text-ink sm:text-sm">{location.localityName}</p>
            <p className="mt-1 text-2xs text-ink-muted">{location.cityName}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
