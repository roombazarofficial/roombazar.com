import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "About RoomBazar | Find Rooms, PGs & Shared Spaces",
  description:
    "Learn about RoomBazar, a simple way to find rooms, PGs and shared spaces and connect with the people who post them.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <div className="bg-white">
        {/* =========================================================================
            HERO SECTION
            ========================================================================= */}
        <section className="relative border-b border-line bg-[#FFF9F7] px-4 py-16 sm:py-20">
          {/* Subtle architectural floor-plan background lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(#171717 1px, transparent 1px), linear-gradient(to right, #171717 1px, transparent 1px)`,
              backgroundSize: "24px 24px, 120px 120px",
            }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-brand-50 border border-brand-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              About RoomBazar
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Finding a place shouldn&apos;t be this complicated.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              RoomBazar makes it easier to find rooms, PGs and shared spaces, connect with the person who posted them, and arrange a visit.
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div className="mx-auto max-w-3xl px-4 py-14 sm:py-16">
          {/* =========================================================================
              WHAT IS ROOMBAZAR?
              ========================================================================= */}
          <section className="border-b border-line pb-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              What is RoomBazar?
            </h2>
            <div className="mt-4 space-y-3.5 text-base leading-relaxed text-ink-muted">
              <p>
                RoomBazar is a place to find rooms, PGs and shared spaces without making the search harder than it needs to be.
              </p>
              <p>
                People can browse available places, check the details, connect with the person who posted the listing, and arrange a visit directly.
              </p>
              <p>
                People with a room to rent can also post their listing and reach people who are looking for a place.
              </p>
            </div>
          </section>

          {/* =========================================================================
              THE PROBLEM
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Finding a place can be frustrating.
            </h2>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              Anyone who has looked for a room or flatmate in a city knows the common issues:
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Too many listings with unclear details.",
                "Unnecessary broker involvement.",
                "Difficulty knowing who actually posted a place.",
                "Time wasted calling or messaging multiple people.",
                "Unclear information about rent, availability and location.",
                "Difficulty deciding whether a place is worth visiting.",
              ].map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                  <span className="mt-1 flex size-2 shrink-0 rounded-full bg-brand-600" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* =========================================================================
              OUR APPROACH (WE'RE KEEPING IT SIMPLE)
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              We&apos;re keeping it simple.
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-[#FFF9F7]/60 p-5">
                <span className="text-xs font-bold text-brand-600">01</span>
                <h3 className="mt-1 text-base font-bold text-ink">Search by what matters.</h3>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                  Location, rent, move-in date and the type of place you need.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-[#FFF9F7]/60 p-5">
                <span className="text-xs font-bold text-brand-600">02</span>
                <h3 className="mt-1 text-base font-bold text-ink">Know who posted it.</h3>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                  Listings clearly show whether they were posted by an owner, current tenant or agent.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-[#FFF9F7]/60 p-5">
                <span className="text-xs font-bold text-brand-600">03</span>
                <h3 className="mt-1 text-base font-bold text-ink">Talk directly.</h3>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                  Message the person who posted the listing directly.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-[#FFF9F7]/60 p-5">
                <span className="text-xs font-bold text-brand-600">04</span>
                <h3 className="mt-1 text-base font-bold text-ink">See the place before deciding.</h3>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                  Arrange a visit and make your own decision before paying anything.
                </p>
              </div>
            </div>
          </section>

          {/* =========================================================================
              TRANSPARENCY (KNOW WHO YOU'RE TALKING TO)
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Know who you&apos;re talking to.
            </h2>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-muted">
              <p>
                Not every listing comes from the same kind of person. A listing may be posted by an owner, a current tenant, or an agent.
              </p>
              <p>
                RoomBazar aims to make that information clear so people can make better decisions before they arrange a visit.
              </p>
            </div>
          </section>

          {/* =========================================================================
              FOR PEOPLE LOOKING & LISTING
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Looking for a place */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6">
                <div>
                  <h3 className="text-lg font-bold text-ink">Looking for a place?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Search by location, move-in date and the number of people. Compare listings, save places you like, and message the person who posted them.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href={routes.rooms}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-[0.98]"
                  >
                    Browse rooms
                  </Link>
                </div>
              </div>

              {/* Have a place to rent */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-[#FFF9F7] p-6">
                <div>
                  <h3 className="text-lg font-bold text-ink">Have a place to rent?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Post your room or available space, add the details people need, upload photos, and start receiving enquiries.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href={routes.post}
                    className="inline-flex items-center justify-center rounded-lg border border-brand-600 bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 shadow-xs transition-all hover:bg-brand-50 active:scale-[0.98]"
                  >
                    Post a room
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              HOW ROOMBAZAR WORKS (3-STEP FLOW)
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              How RoomBazar works
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 border border-brand-100">
                  1
                </span>
                <h3 className="mt-3 text-base font-bold text-ink">Search</h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  Find places in the areas you&apos;re interested in.
                </p>
              </div>

              <div>
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 border border-brand-100">
                  2
                </span>
                <h3 className="mt-3 text-base font-bold text-ink">Connect</h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  Message the person who posted the listing.
                </p>
              </div>

              <div>
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 border border-brand-100">
                  3
                </span>
                <h3 className="mt-3 text-base font-bold text-ink">Visit</h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  Arrange a visit and see the place for yourself.
                </p>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SAFETY SECTION
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Take your time before you pay.
            </h2>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-muted">
              <p>
                RoomBazar helps people discover places and connect with listing posters. Before making any payment, visit the place, verify the details, and make sure you understand the terms.
              </p>
              <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 text-sm font-medium text-brand-900">
                ⚠️ <strong className="font-semibold text-brand-700">Important:</strong> Never pay an advance or deposit before visiting the place in person.
              </div>
            </div>
            <div className="mt-5">
              <Link
                href={routes.safety}
                className="text-sm font-semibold text-brand-600 underline underline-offset-4 hover:text-brand-700"
              >
                Read our safety tips →
              </Link>
            </div>
          </section>

          {/* =========================================================================
              WHAT ROOMBAZAR DOES NOT DO
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              RoomBazar is a marketplace, not your rental agreement.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              Listings are posted by users. RoomBazar helps people discover listings and connect with the people behind them, but it is not a party to the rental agreement between users.
            </p>
          </section>

          {/* =========================================================================
              OUR VISION
              ========================================================================= */}
          <section className="border-b border-line py-12">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Where we&apos;re going
            </h2>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-muted">
              <p>
                We want finding a place to feel simpler, clearer and more human.
              </p>
              <p>
                RoomBazar is starting with rooms, PGs and shared spaces, with a long-term goal of making it easier for people to find the right place in the cities they live and move to.
              </p>
            </div>
          </section>

          {/* =========================================================================
              FINAL CTA SECTION
              ========================================================================= */}
          <section className="pt-12 text-center">
            <div className="rounded-3xl border border-line bg-[#FFF9F7] p-8 sm:p-12">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Looking for a place?
              </h2>
              <p className="mt-2 text-sm text-ink-muted sm:text-base">
                Start with a search and see what&apos;s available.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href={routes.rooms}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-7 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-[0.98]"
                >
                  Browse rooms
                </Link>
                <Link
                  href={routes.post}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-7 text-sm font-semibold text-ink shadow-xs transition-all hover:bg-surface-muted active:scale-[0.98]"
                >
                  Post a room
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
