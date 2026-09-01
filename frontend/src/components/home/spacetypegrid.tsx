"use client";

import Link from "next/link";
import { routes } from "@/lib/constants/routes";

const SPACE_TYPES = [
  {
    label: "Room",
    sublabel: "Single rooms & PGs",
    href: routes.rooms,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: "from-brand-50 to-brand-100",
    iconColor: "text-brand-600",
    border: "border-brand-200 hover:border-brand-400",
  },
  {
    label: "Flat",
    sublabel: "Full apartments",
    href: routes.rooms,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M8 21V11h8v10" />
        <path d="M2 11h20" />
        <path d="M8 7h.01M12 7h.01M16 7h.01" />
      </svg>
    ),
    color: "from-blue-50 to-indigo-50",
    iconColor: "text-indigo-600",
    border: "border-indigo-100 hover:border-indigo-300",
  },
  {
    label: "House",
    sublabel: "Independent houses",
    href: routes.rooms,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M22 10v12H2V10L12 2z" />
        <path d="M6 22v-8h12v8" />
        <path d="M10 22v-4h4v4" />
        <path d="M9.5 8h5" />
      </svg>
    ),
    color: "from-emerald-50 to-teal-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100 hover:border-emerald-300",
  },
  {
    label: "Office",
    sublabel: "Workspaces & cabins",
    href: routes.rooms,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M8 3v18M16 3v18M2 9h20M2 15h20" />
      </svg>
    ),
    color: "from-amber-50 to-orange-50",
    iconColor: "text-amber-600",
    border: "border-amber-100 hover:border-amber-300",
  },
  {
    label: "Shop",
    sublabel: "Retail & commercial",
    href: routes.rooms,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    color: "from-purple-50 to-violet-50",
    iconColor: "text-purple-600",
    border: "border-purple-100 hover:border-purple-300",
  },
  {
    label: "Hall",
    sublabel: "Events & functions",
    href: routes.rooms,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M2 20h20M4 20V8l8-6 8 6v12" />
        <path d="M10 20v-6h4v6" />
        <path d="M8 11h.01M12 11h.01M16 11h.01" />
      </svg>
    ),
    color: "from-rose-50 to-pink-50",
    iconColor: "text-rose-600",
    border: "border-rose-100 hover:border-rose-300",
  },
];

export function SpaceTypeGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      {/* Section header */}
      <div className="mb-6">
        <p className="text-2xs font-bold uppercase tracking-widest text-brand-600">
          What are you looking for?
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Explore by space type
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {SPACE_TYPES.map((type, i) => (
          <Link
            key={type.label}
            href={type.href}
            className={`
              group flex flex-col items-center gap-2.5 rounded-2xl border bg-gradient-to-br
              p-4 text-center transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-raised
              ${type.color} ${type.border}
              animate-fade-up stagger-${Math.min(i + 1, 6)}
            `}
          >
            <div
              className={`
                flex size-12 sm:size-14 items-center justify-center rounded-xl
                bg-white/70 transition-transform duration-200 group-hover:scale-110
                ${type.iconColor}
              `}
            >
              {type.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{type.label}</p>
              <p className="mt-0.5 hidden text-[11px] text-ink-muted sm:block">
                {type.sublabel}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
