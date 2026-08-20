"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/constants/routes";
import { useAuthUi } from "@/store/authuistore";

export function SiteHeader() {
  const router = useRouter();
  const user = useAuthUi((state) => state.user);
  const loaded = useAuthUi((state) => state.loaded);
  const openSignIn = useAuthUi((state) => state.openSignIn);

  function hostRoom() {
    if (!loaded) {
      router.push(routes.post);
      return;
    }

    if (user) {
      router.push(routes.post);
      return;
    }

    openSignIn({
      intent: "Sign in or create an account to host your room.",
      next: routes.post,
    });
  }

  return (
    <header className="w-full border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href={routes.home}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink"
          >
            <Image
              src="/logo/rb-logo.png"
              alt="RoomBazar Logo"
              width={30}
              height={30}
              className="size-7.5 rounded-full object-contain"
              priority
            />
            <span className="font-bold text-ink text-base sm:text-lg">
              Room<span className="text-brand-600">Bazar</span>
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={hostRoom}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              className="size-4.5 shrink-0"
              aria-hidden
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Host a room</span>
          </button>

          {user ? (
            <Link
              href={routes.dashboard}
              className="px-2 py-1.5 text-sm font-medium text-ink transition-colors hover:text-brand-600"
            >
              Dashboard
            </Link>
          ) : (
          <button
            type="button"
            onClick={() => openSignIn()}
            className="text-sm font-medium text-ink transition-colors hover:text-brand-600 px-2 py-1.5"
          >
            Sign in
          </button>
          )}
        </div>
      </div>
    </header>
  );
}
