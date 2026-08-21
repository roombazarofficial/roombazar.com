"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getAuditLog, type AuditEntry } from "@/lib/api/superadmin";

export function ManagingTopbar({
  publicSite,
  logoUrl,
}: {
  publicSite: string;
  logoUrl: string;
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    getAuditLog(200)
      .then((items) => {
        if (active) setEntries(items);
      })
      .catch(() => {
        if (active) setEntries([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-xs">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 lg:hidden">
          <img src={logoUrl} alt="RoomBazar" width={30} height={30} className="size-7 rounded-full" />
          <span className="text-sm font-bold">Room<span className="text-brand-600">Bazar</span></span>
        </Link>
        <form action="/listings" className="relative min-w-0 max-w-2xl flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            name="query"
            type="search"
            placeholder="Search listings, users, cities..."
            className="h-11 w-full rounded-full border border-line-strong bg-surface-muted pl-11 pr-16 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-0.5 text-2xs text-ink-subtle">Ctrl K</kbd>
        </form>
        <div className="ml-auto flex items-center gap-3">
          <div ref={panelRef} className="relative">
            <button
              type="button"
              aria-label={`Notifications${entries.length ? `, ${entries.length} audit events` : ""}`}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="relative flex size-10 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
              {entries.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                  {entries.length > 99 ? "99+" : entries.length}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-surface shadow-overlay">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <div>
                    <h2 className="text-sm font-bold text-ink">Admin notifications</h2>
                    <p className="mt-0.5 text-xs text-ink-muted">CRUD and moderation activity</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2 py-1 text-2xs font-semibold text-brand-700">{entries.length} events</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {entries.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-ink-muted">No audit activity yet.</p>
                  ) : (
                    entries.slice(0, 12).map((entry) => (
                      <div key={entry.id} className="border-b border-line px-4 py-3 last:border-0 hover:bg-surface-muted">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-ink">{formatAction(entry.action)}</p>
                          <time className="shrink-0 text-2xs text-ink-subtle" dateTime={entry.createdAt}>
                            {formatTime(entry.createdAt)}
                          </time>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{entry.note || `${entry.targetType} ${entry.targetId}`}</p>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/audit-log" onClick={() => setOpen(false)} className="block border-t border-line bg-surface-muted px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:text-brand-700">
                  View all audit activity →
                </Link>
              </div>
            )}
          </div>
          <a href={publicSite} className="hidden items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-700 sm:inline-flex" rel="noreferrer">
            Public portal
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function formatAction(action: string) {
  const readable = action
    .replace(
      /^(create|update|delete|approve|reject|suspend|reinstate|change|restrict|unrestrict|uphold|dismiss)/,
      "$1 ",
    )
    .replace(/([a-z])([A-Z])/g, "$1 $2");

  return readable.replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
