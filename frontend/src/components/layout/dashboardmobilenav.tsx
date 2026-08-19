"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";

/**
 * Fixed bottom bar on phones. Four destinations only — a bottom bar with
 * seven items is a bottom bar nobody hits accurately.
 */
const items = [
  { href: routes.dashboard, label: "Home" },
  { href: routes.myListings, label: "Listings" },
  { href: routes.inbox, label: "Inbox" },
  { href: routes.saved, label: "Saved" },
];

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden"
    >
      <ul className="flex">
        {items.map((item) => {
          const active =
            item.href === routes.dashboard
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 items-center justify-center text-xs font-medium",
                  active ? "text-brand-700" : "text-ink-muted",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
