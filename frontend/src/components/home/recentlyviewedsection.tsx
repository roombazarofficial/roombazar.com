"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readRecentlyViewed, type RecentlyViewedEntry } from "@/lib/recentlyviewed";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

/**
 * Real per-browser history only — renders nothing when there isn't any,
 * rather than showing a fake/empty "recommendations" section.
 */
export function RecentlyViewedSection() {
  const [entries, setEntries] = useState<RecentlyViewedEntry[] | null>(null);

  useEffect(() => {
    setEntries(readRecentlyViewed());
  }, []);

  if (!entries || entries.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-2 pb-10">
      <div className="mb-6">
        <p className="text-2xs font-bold uppercase tracking-widest text-brand-600">
          Continue exploring
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-ink sm:text-xl">
          Recently viewed
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={routes.listing(entry.slug)}
            className="group flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="aspect-[16/11] w-full overflow-hidden bg-surface-sunken">
              {entry.coverPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.coverPhotoUrl}
                  alt={entry.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-ink-subtle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-sm font-bold text-brand-600">
                {formatRupees(entry.rentPaise)}
                <span className="text-xs font-normal text-ink-subtle"> /mo</span>
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-ink">{entry.title}</p>
              <p className="truncate text-2xs text-ink-muted">
                {entry.localityName}, {entry.cityName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
