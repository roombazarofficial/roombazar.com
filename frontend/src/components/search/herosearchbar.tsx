"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildSearchQuery } from "@/lib/utils/querystring";
import { routes } from "@/lib/constants/routes";
import type { Locality } from "@/types/locality";

export function HeroSearchBar({
  localities,
  citySlug,
}: {
  localities: Locality[];
  citySlug: string;
}) {
  const router = useRouter();

  const [localitySlug, setLocalitySlug] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [people, setPeople] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const query = buildSearchQuery({
      localitySlugs: localitySlug ? [localitySlug] : [],
      availableFrom: moveIn || null,
      occupancy: people ? Number(people) : null,
    });

    router.push(`${routes.city(citySlug)}${query}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-9 w-full max-w-3xl overflow-hidden rounded-sheet border border-line bg-surface shadow-raised sm:rounded-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center">
        <Segment label="Where" htmlFor="hero-where">
          <select
            id="hero-where"
            value={localitySlug}
            onChange={(event) => setLocalitySlug(event.target.value)}
            className="w-full cursor-pointer bg-transparent text-sm text-ink outline-none"
          >
            <option value="">Anywhere in the city</option>

            {localities.map((locality) => (
              <option key={locality.id} value={locality.slug}>
                {locality.name}
              </option>

            ))}
          </select>

        </Segment>

        <Divider />

        <Segment label="Move in" htmlFor="hero-movein">
          <input
            id="hero-movein"
            type="date"
            value={moveIn}
            onChange={(event) => setMoveIn(event.target.value)}
            className="w-full bg-transparent text-sm text-ink outline-none"
          />

        </Segment>

        <Divider />

        <Segment label="People" htmlFor="hero-people">
          <select
            id="hero-people"
            value={people}
            onChange={(event) => setPeople(event.target.value)}
            className="w-full cursor-pointer bg-transparent text-sm text-ink outline-none"
          >
            <option value="">Any</option>

            <option value="1">1 person</option>

            <option value="2">2 people</option>

            <option value="3">3 people</option>

            <option value="4">4 or more</option>

          </select>

        </Segment>

        <div className="p-2 sm:pr-2">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-medium text-ink-inverse transition-colors hover:bg-brand-700 sm:size-12 sm:px-0"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <span className="sm:sr-only">Search rooms</span>

          </button>

        </div>

      </div>

    </form>

  );
}

function Segment({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1 px-5 py-3 transition-colors hover:bg-surface-muted sm:rounded-full">
      <label
        htmlFor={htmlFor}
        className="block text-2xs font-semibold uppercase tracking-wide text-ink"
      >
        {label}
      </label>

      <div className="mt-0.5">{children}</div>

    </div>

  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="h-px w-full bg-line sm:h-8 sm:w-px sm:shrink-0"
    />

  );
}
