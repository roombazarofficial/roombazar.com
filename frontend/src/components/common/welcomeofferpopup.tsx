"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/constants/routes";

const AUTO_CLOSE_SECONDS = 8;
const STORAGE_KEY = "roombazar_welcome_offer_shown";

export function WelcomeOfferPopup() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Only show if user has never seen it before
    try {
      const alreadySeen = localStorage.getItem(STORAGE_KEY);
      if (alreadySeen) return;
    } catch {
      // LocalStorage access restricted (e.g. private mode)
    }

    // Show smoothly after initial page load
    const showTimeout = setTimeout(() => {
      setOpen(true);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore
      }
    }, 400);

    return () => clearTimeout(showTimeout);
  }, []);

  useEffect(() => {
    if (!open || isPaused) return;

    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, AUTO_CLOSE_SECONDS * 1000);

    return () => clearTimeout(autoCloseTimer);
  }, [open, isPaused]);

  function handleClose() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  }

  function handleExplore() {
    handleClose();
    router.push(routes.rooms);
  }

  function handlePost() {
    handleClose();
    router.push(routes.post);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-300"
      >
        {/* Close Button on Top-Right */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close offer popup"
          className="absolute top-3.5 right-3.5 z-20 flex size-8 items-center justify-center rounded-full bg-surface-muted/90 text-ink-muted hover:bg-brand-50 hover:text-brand-700 transition-colors shadow-2xs focus:outline-none cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Hero Graphic with Brand Colors */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-amber-600 px-6 pt-7 pb-6 text-white text-center">
          {/* Subtle Background Pattern Elements */}
          <div className="absolute -top-10 -right-10 size-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 size-36 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200 shadow-inner mb-3 border border-white/20">
            <span>✨</span>
            <span>100% Zero Brokerage Promise</span>
            <span>🎉</span>
          </div>

          {/* Logo & Headline */}
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Image
              src="/logo/rb-logo.png"
              alt="RoomBazar Logo"
              width={36}
              height={36}
              className="size-8 rounded-full bg-white p-0.5 shadow-md"
            />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              Room<span className="text-amber-300">Bazar</span>
            </h2>
          </div>

          <p className="text-sm sm:text-base font-semibold text-white/95 max-w-sm mx-auto leading-snug">
            Direct Owner Contact · No Broker Fee · No Hidden Charges
          </p>
        </div>

        {/* Offer Highlights & Benefits */}
        <div className="p-5 sm:p-6 space-y-3.5 bg-gradient-to-b from-white to-orange-50/30">
          <div className="grid gap-2.5 sm:gap-3">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3 rounded-xl border border-line/80 bg-white p-3 shadow-2xs hover:border-brand-300 hover:shadow-xs transition-all">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-base">
                ₹0
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-ink">
                  Zero Broker Fee & Zero Commission
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Save thousands on broker fees. Search, compare, and rent rooms completely free of cost.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3 rounded-xl border border-line/80 bg-white p-3 shadow-2xs hover:border-brand-300 hover:shadow-xs transition-all">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-bold text-base">
                💬
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-ink">
                  Direct Owner Chat & Direct Calls
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Connect straight with verified property hosts and current tenants without middlemen.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3 rounded-xl border border-line/80 bg-white p-3 shadow-2xs hover:border-brand-300 hover:shadow-xs transition-all">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-base">
                🛡️
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-ink">
                  Verified Rooms & Safe Direct Pay
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Visit rooms in person before paying. No advance fees or fake intermediaries.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleExplore}
              className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-sm shadow-md hover:from-brand-700 hover:to-brand-800 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Explore Verified Rooms</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handlePost}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-surface-muted hover:text-brand-700 transition-colors cursor-pointer"
            >
              Post Room Free
            </button>
          </div>

          {/* Bottom Micro Footer */}
          <p className="text-center text-[11px] text-ink-subtle">
            Rooms · PGs · Flats · 1 RK · Hostels across India
          </p>
        </div>
      </div>
    </div>
  );
}
