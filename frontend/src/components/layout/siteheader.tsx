"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/constants/routes";
import { useAuthUi } from "@/store/authuistore";
import { logout } from "@/lib/api/auth";

export function SiteHeader() {
  const router = useRouter();
  const user = useAuthUi((state) => state.user);
  const loaded = useAuthUi((state) => state.loaded);
  const openSignIn = useAuthUi((state) => state.openSignIn);
  const setUser = useAuthUi((state) => state.setUser);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  function handleSellClick() {
    if (!loaded) {
      router.push(routes.post);
      return;
    }

    if (user) {
      router.push(routes.post);
      return;
    }

    openSignIn({
      intent: "Sign in or create an account to post your room.",
      next: routes.post,
    });
  }

  function handleWishlistClick(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      openSignIn({
        intent: "Sign in to view your saved rooms and wishlist.",
        next: routes.saved,
      });
    }
  }

  function handleChatClick(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      openSignIn({
        intent: "Sign in to view your chats and messages.",
        next: routes.inbox,
      });
    }
  }

  async function handleLogout() {
    setIsMenuOpen(false);
    try {
      await logout();
    } catch {
      // Proceed with local state reset even if network call fails
    }
    setUser(null);
    router.push(routes.home);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={routes.home}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink hover:opacity-95 transition-opacity"
          >
            <Image
              src="/logo/rb-logo.png"
              alt="RoomBazar Logo"
              width={34}
              height={34}
              className="size-8 sm:size-8.5 rounded-full object-contain shadow-2xs"
              priority
            />
            <span className="font-extrabold text-ink text-lg sm:text-xl tracking-tight">
              Room<span className="text-brand-600">Bazar</span>
            </span>
          </Link>
        </div>

        {/* Right: 4 Navigation Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
          {/* 1. Wishlist Button */}
          <Link
            href={user ? routes.saved : "#"}
            onClick={handleWishlistClick}
            className="group flex flex-col items-center justify-center text-ink hover:text-brand-600 transition-colors px-1 py-0.5"
            title="Wishlist"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5 sm:size-5.5 text-ink group-hover:text-brand-600 group-hover:scale-110 transition-all"
              aria-hidden
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span className="text-[11px] sm:text-xs font-semibold text-ink group-hover:text-brand-600 transition-colors leading-tight mt-0.5">
              Wishlist
            </span>
          </Link>

          {/* 2. Chat Button */}
          <Link
            href={user ? routes.inbox : "#"}
            onClick={handleChatClick}
            className="group relative flex flex-col items-center justify-center text-ink hover:text-brand-600 transition-colors px-1 py-0.5"
            title="Chat"
          >
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 sm:size-5.5 text-ink group-hover:text-brand-600 group-hover:scale-110 transition-all"
                aria-hidden
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {user && (user.unreadMessageCount ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {user.unreadMessageCount > 9 ? "9+" : user.unreadMessageCount}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-ink group-hover:text-brand-600 transition-colors leading-tight mt-0.5">
              Chat
            </span>
          </Link>

          {/* 3. User Avatar Profile Button & Dropdown */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full p-0.5 ring-2 ring-brand-500/80 hover:ring-brand-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 shadow-2xs"
                aria-label="User profile menu"
                aria-expanded={isMenuOpen}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User profile"}
                    className="size-8 sm:size-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200 shadow-inner">
                    {/* Stylized Avatar with RoomBazar brand colors */}
                    <svg
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-full rounded-full"
                    >
                      <circle cx="18" cy="18" r="18" fill="#fce9e6" />
                      {/* Hair */}
                      <path
                        d="M10 16c-1-3 0-7 3-9 3-2 8-2 11 0 3 2 4 6 3 9-1 1-2 2-3 2-2 0-3-1-4-1s-2 1-4 1c-1 0-2-1-3-2-1 0-2 0-3 0Z"
                        fill="#721c13"
                      />
                      {/* Face */}
                      <circle cx="18" cy="19" r="7" fill="#fff9f7" />
                      {/* Eyes */}
                      <circle cx="16" cy="18.5" r="1.2" fill="#721c13" />
                      <circle cx="20" cy="18.5" r="1.2" fill="#721c13" />
                      {/* Shirt */}
                      <path
                        d="M11 31c0-4.5 3.5-7 7-7s7 2.5 7 7v2H11v-2Z"
                        fill="#d13421"
                      />
                    </svg>
                  </div>
                )}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`size-4 text-ink-muted transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180 text-brand-600" : ""
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

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl border border-line bg-white py-2 shadow-raised transition-all z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="border-b border-line px-4 py-3 bg-surface-muted/60">
                    <p className="text-sm font-semibold text-ink truncate">
                      {user.name || "Customer User"}
                    </p>
                    <p className="text-xs text-ink-muted truncate">
                      {user.email || user.phone || "RoomBazar Member"}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href={routes.dashboard}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-4 text-ink-muted"
                      >
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                      Dashboard
                    </Link>

                    <Link
                      href={routes.myListings}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-4 text-ink-muted"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      My Listings
                    </Link>

                    <Link
                      href={routes.profile}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-4 text-ink-muted"
                      >
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 1 0-16 0" />
                      </svg>
                      Profile & Settings
                    </Link>
                  </div>

                  <div className="border-t border-line mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-danger hover:bg-danger-soft transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-4 text-danger"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openSignIn()}
              className="text-sm font-semibold text-ink transition-colors hover:text-brand-600 px-2 py-1.5"
            >
              Sign in
            </button>
          )}

          {/* 4. + SELL Pill Action Button matching RoomBazar brand palette */}
          <button
            type="button"
            onClick={handleSellClick}
            className="group relative inline-flex items-center justify-center rounded-full p-[3px] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-2xs hover:shadow-md cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, #f59e0b 0%, #f97316 25%, #df4934 60%, #b42318 100%)",
            }}
            title="Host / Sell a room"
          >
            <span className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3.5 sm:px-5 text-xs sm:text-sm font-extrabold tracking-wider text-brand-700 transition-colors group-hover:bg-brand-50/80 group-hover:text-brand-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 sm:size-4 shrink-0 text-brand-600 group-hover:text-brand-700"
                aria-hidden
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>SELL</span>
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}
