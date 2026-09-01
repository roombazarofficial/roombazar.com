"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/constants/routes";

interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

const exploreSection: FooterSection = {
  title: "EXPLORE",
  links: [
    { label: "Browse all rooms", href: routes.rooms },
    { label: "Host a room (0% fee)", href: routes.post },
    { label: "Safety guidelines", href: routes.safety },
    { label: "Help & FAQs", href: routes.help },
  ],
};

const citiesSection: FooterSection = {
  title: "TOP CITIES",
  links: [
    { label: "Rooms in Bengaluru", href: routes.city("bengaluru") },
    { label: "Rooms in Noida", href: routes.city("gautam-buddha-nagar") },
    { label: "Rooms in Delhi NCR", href: routes.city("delhi") },
    { label: "Rooms in Gurugram", href: routes.city("gurugram") },
    { label: "Rooms in Ghaziabad", href: routes.city("ghaziabad") },
    { label: "Rooms in Mumbai", href: routes.city("mumbai") },
    { label: "Rooms in Pune", href: routes.city("pune") },
    { label: "Rooms in Hyderabad", href: routes.city("hyderabad") },
  ],
};

const companySection: FooterSection = {
  title: "ROOMBAZAR",
  links: [
    { label: "About RoomBazar", href: routes.about },
    { label: "How it works", href: `${routes.about}#how-it-works` },
    { label: "Trust & verification", href: routes.safety },
    { label: "Contact us", href: routes.contact },
  ],
};

const legalSection: FooterSection = {
  title: "LEGAL",
  links: [
    { label: "Privacy policy", href: routes.privacy },
    { label: "Terms & conditions", href: routes.terms },
    { label: "Cookie policy", href: `${routes.privacy}#cookies` },
    { label: "Disclaimer", href: `${routes.terms}#disclaimer` },
  ],
};

type SectionKey = "EXPLORE" | "CITIES" | "ROOMBAZAR" | "LEGAL";

export function SiteFooter() {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    EXPLORE: false,
    CITIES: false,
    ROOMBAZAR: false,
    LEGAL: false,
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <footer className="border-t border-line bg-surface-muted text-ink">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:pt-16 sm:pb-12">
        {/* Main 5-Column Layout (Desktop/Tablet) & Collapsible (Mobile) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Column 1: Brand & Social Media */}
          <div className="flex flex-col space-y-4 lg:col-span-1">
            <Link
              href={routes.home}
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-ink"
            >
              <Image
                src="/logo/rb-logo.png"
                alt="RoomBazar logo"
                width={28}
                height={28}
                className="size-7 rounded-full"
              />
              <span>
                Room<span className="text-brand-600">Bazar</span>
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              Direct-from-owner room rental marketplace with 0% brokerage fees.
            </p>

            <a
              href="mailto:roombazar.official@gmail.com"
              className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted transition-colors duration-150 hover:text-brand-600"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0 text-ink-muted"
                aria-hidden
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>roombazar.official@gmail.com</span>
            </a>

            {/* Social Media Links */}
            <div className="pt-2">
              <div className="flex items-center gap-4 text-ink-muted">
                <a
                  href="https://www.instagram.com/roombzr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RoomBazar on Instagram"
                  className="transition-colors duration-150 hover:text-brand-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61593239100172"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RoomBazar on Facebook"
                  className="transition-colors duration-150 hover:text-brand-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: EXPLORE */}
          <FooterColumnGroup
            section={exploreSection}
            isOpen={openSections.EXPLORE}
            onToggle={() => toggleSection("EXPLORE")}
          />

          {/* Column 3: TOP CITIES */}
          <FooterColumnGroup
            section={citiesSection}
            isOpen={openSections.CITIES}
            onToggle={() => toggleSection("CITIES")}
          />

          {/* Column 4: ROOMBAZAR */}
          <FooterColumnGroup
            section={companySection}
            isOpen={openSections.ROOMBAZAR}
            onToggle={() => toggleSection("ROOMBAZAR")}
          />

          {/* Column 5: LEGAL */}
          <FooterColumnGroup
            section={legalSection}
            isOpen={openSections.LEGAL}
            onToggle={() => toggleSection("LEGAL")}
          />
        </div>

        {/* Subtle Horizontal Divider */}
        <hr className="mt-12 mb-8 border-line" />

        {/* Bottom Bar: Copyright, Legal Context, Language & Currency */}
        <div className="flex flex-col gap-4 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="font-medium text-ink">© 2026 RoomBazar</span>
            <span className="hidden text-line-strong sm:inline">·</span>
            <span className="text-ink-subtle">
              Listings are posted directly by verified users; 0% brokerage fee.
            </span>
          </div>

          <div className="flex items-center gap-4 self-start pt-2 sm:self-auto sm:pt-0">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 font-medium text-ink">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 text-ink-muted"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>English (IN)</span>
            </div>

            {/* Currency */}
            <div className="font-medium text-ink">
              <span>₹ INR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumnGroup({
  section,
  isOpen,
  onToggle,
}: {
  section: FooterSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-line pb-4 last:border-b-0 md:border-b-0 md:pb-0">
      {/* Desktop/Tablet Header */}
      <h3 className="hidden text-xs font-semibold uppercase tracking-wider text-ink md:block">
        {section.title}
      </h3>

      {/* Mobile Accordion Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink focus:outline-none md:hidden"
        aria-expanded={isOpen}
      >
        <span>{section.title}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 text-ink-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Links List */}
      <ul
        className={`mt-3 space-y-2 text-sm text-ink-muted ${
          isOpen ? "block" : "hidden md:block"
        }`}
      >
        {section.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block transition-colors duration-150 hover:text-brand-600 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
