"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/classnames";

const groups = [
  {
    heading: "Queues",
    items: [
      { href: "/admin/moderation", label: "Moderation" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/verification", label: "Verification" },
      { href: "/admin/localities/requests", label: "Locality requests" },
    ],
  },
  {
    heading: "Records",
    items: [
      { href: "/admin/listings", label: "Listings" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/audit-log", label: "Audit log" },
    ],
  },
  {
    heading: "Messaging",
    items: [
      { href: "/admin/notifications", label: "Send notification" },
      { href: "/admin/notifications/history", label: "Notification history" },
    ],
  },
  {
    heading: "Reference data",
    items: [
      { href: "/admin/cities", label: "Cities" },
      { href: "/admin/localities", label: "Localities" },
      { href: "/admin/amenities", label: "Amenities" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin/notifications"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <nav aria-label="Admin" className="md:w-56 md:shrink-0">
      {/* Mobile / tablet: one horizontally-scrollable row of links. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:hidden">
        {groups.flatMap((group) =>
          group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isActive(item.href)
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : "border-line bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          )),
        )}
      </div>

      {/* Desktop: grouped vertical list. */}
      <div className="hidden space-y-6 md:block">
        {groups.map((group) => (
          <div key={group.heading}>
            <h2 className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wide text-ink-subtle">
              {group.heading}
            </h2>

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
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

          </div>

        ))}
      </div>

    </nav>

  );
}
