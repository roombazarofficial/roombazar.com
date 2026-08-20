"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/classnames";

const groups = [
  {
    heading: "Queues",
    items: [
      { href: "/approvals", label: "Approvals" },
      { href: "/reports", label: "Reports" },
      { href: "/verification", label: "Verification" },
      { href: "/localities/requests", label: "Locality requests" },
    ],
  },
  {
    heading: "Records",
    items: [
      { href: "/listings", label: "Listings" },
      { href: "/users", label: "Users" },
      { href: "/audit-log", label: "Audit log" },
    ],
  },
  {
    heading: "Reference data",
    items: [
      { href: "/cities", label: "Cities" },
      { href: "/localities", label: "Localities" },
      { href: "/amenities", label: "Amenities" },
    ],
  },
];

export function ManagingSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="w-56 shrink-0">
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.heading}>
            <h2 className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wide text-ink-subtle">
              {group.heading}
            </h2>

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
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
