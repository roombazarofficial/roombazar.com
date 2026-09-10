"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ManagingSidebar } from "./managingsidebar";
import { SignOutButton } from "./signoutbutton";

/**
 * The console navigation for screens below `lg`, where the fixed sidebar is
 * hidden. A hamburger in the topbar opens a slide-over drawer with the same
 * nav, user card and sign-out. Without this there is no way to navigate the
 * console on a phone or tablet in portrait.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line text-ink-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-5"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-ink/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-line bg-surface shadow-overlay">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo/rb-logo.png"
                  alt="RoomBazar Logo"
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full object-contain"
                  priority
                />
                <span className="text-sm font-bold tracking-tight">
                  Room<span className="text-brand-600">Bazar</span>
                  <span className="block text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                    Management
                  </span>
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-surface-muted"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-5"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ManagingSidebar />

            <div className="mt-auto border-t border-line p-4">
              <div className="mb-3 flex items-center gap-3 rounded-card bg-surface-muted p-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  S
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    Super admin
                  </p>
                  <p className="text-xs text-ink-muted">Full access</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
