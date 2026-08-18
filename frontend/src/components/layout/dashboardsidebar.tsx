"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";

const items = [
  { href: routes.dashboard, label: "Overview" },
  { href: routes.myListings, label: "My listings" },
  { href: routes.enquiries, label: "Enquiries" },
  { href: routes.inbox, label: "Inbox" },
  { href: routes.saved, label: "Saved" },
  { href: routes.verification, label: "Verification" },
  { href: routes.profile, label: "Profile" },
  { href: routes.settings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="hidden w-56 shrink-0 md:block">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active =
            item.href === routes.dashboard
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-control px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface font-medium text-ink shadow-card"
                    : "text-ink-muted hover:bg-surface hover:text-ink",
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
