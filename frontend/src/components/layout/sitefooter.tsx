"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/constants/routes";

interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

const exploreSection: FooterSection = {
  title: "EXPLORE",
  links: [
    { label: "Browse rooms", href: routes.rooms },
    { label: "Popular locations", href: routes.city("bengaluru") },
    { label: "Recently posted", href: `${routes.city("bengaluru")}?sort=newest` },
    { label: "Post a room", href: routes.post },
  ],
};

const companySection: FooterSection = {
  title: "ROOMBAZAR",
  links: [
    { label: "How it works", href: routes.about },
    { label: "Safety tips", href: routes.safety },
    { label: "About us", href: routes.about },
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

type SectionKey = "EXPLORE" | "ROOMBAZAR" | "LEGAL";

export function SiteFooter() {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    EXPLORE: false,
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
        {/* Main 4-Column Layout (Desktop/Tablet) & Collapsible (Mobile) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Column 1: Brand & Social Media */}
          <div className="flex flex-col space-y-4">
            <Link
              href={routes.home}
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-ink"
            >
              <img
                src="/logo/rb-logo.png"
                alt="RoomBazar logo"
                className="size-7 rounded-full"
              />
              <span>
                Room<span className="text-brand-600">Bazar</span>
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              Find rooms, PGs and shared spaces in one place.
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

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RoomBazar on X (Twitter)"
                  className="transition-colors duration-150 hover:text-brand-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4.5"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RoomBazar on LinkedIn"
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
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
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

          {/* Column 3: ROOMBAZAR */}
          <FooterColumnGroup
            section={companySection}
            isOpen={openSections.ROOMBAZAR}
            onToggle={() => toggleSection("ROOMBAZAR")}
          />

          {/* Column 4: LEGAL */}
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
              Listings are posted by users; RoomBazar is not a party to any rental agreement.
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
    <div className="border-b border-line/70 pb-4 md:border-b-0 md:pb-0">
      {/* Mobile Toggle Heading */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-1 text-left text-xs font-semibold uppercase tracking-wider text-ink md:cursor-default md:py-0"
      >
        <span>{section.title}</span>
        <span className="text-ink-muted md:hidden">
          {isOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </span>
      </button>

      {/* Links List */}
      <ul
        className={`mt-3 space-y-2.5 ${
          isOpen ? "block" : "hidden md:block"
        }`}
      >
        {section.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-ink-muted transition-colors duration-150 hover:text-brand-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
