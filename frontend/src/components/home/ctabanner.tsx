"use client";

import Link from "next/link";
import { routes } from "@/lib/constants/routes";
import { useAuthUi } from "@/store/authuistore";

export function CTABanner() {
  const openSignIn = useAuthUi((state) => state.openSignIn);
  const user = useAuthUi((state) => state.user);

  function handleHostClick() {
    if (!user) {
      openSignIn({
        intent: "Sign in or create an account to post your space on RoomBazar.",
        next: routes.post,
      });
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-4">
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-8 sm:px-12 sm:py-12"
        style={{
          background:
            "linear-gradient(135deg, #fff9f7 0%, #fce9e6 40%, #f8cfc8 100%)",
          border: "1px solid #f1a99d",
        }}
      >
        {/* Background decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 size-64 translate-x-1/3 -translate-y-1/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(209,52,33,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 size-48 -translate-x-1/4 translate-y-1/4 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(209,52,33,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Eyebrow */}
            <p className="text-2xs font-bold uppercase tracking-widest text-brand-600">
              For property owners
            </p>
            {/* Heading */}
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink sm:text-3xl">
              Have a space to rent?
            </h2>
            {/* Sub */}
            <p className="mt-2 max-w-md text-sm text-ink-muted sm:text-base">
              Post your room, flat, or any space for free and connect with
              thousands of genuine seekers every day.
            </p>

            {/* Trust micro-stats */}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {[
                { value: "Free", label: "to post" },
                { value: "Direct", label: "from owner" },
                { value: "Safe", label: "in-app chat" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4 text-brand-600 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm11.78-1.72a.75.75 0 0 0-1.06-1.06L7 8.94 5.28 7.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-ink">
                    {stat.value}
                  </span>
                  <span className="text-sm text-ink-muted">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="shrink-0">
            {user ? (
              <Link
                href={routes.post}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-raised transition-all hover:bg-brand-700 active:scale-[0.98] sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="size-4"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Post your space
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleHostClick}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-raised transition-all hover:bg-brand-700 active:scale-[0.98] cursor-pointer sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="size-4"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Post your space
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
