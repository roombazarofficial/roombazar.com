"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/classnames";

const groups = [
  {
    heading: "Workspace",
    items: [{ href: "/", label: "Dashboard" }],
  },
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
  {
    heading: "Quick actions",
    items: [
      { href: "/approvals", label: "Review approvals" },
      { href: "/cities?new=1", label: "Add city" },
      { href: "/localities?new=1", label: "Add locality" },
      { href: "/amenities?new=1", label: "Add amenity" },
    ],
  },
];

export function ManagingSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.heading}>
            <h2 className="mb-2 px-3 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              {group.heading}
            </h2>

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const itemPath = item.href.split("?")[0] ?? item.href;
                const active =
                  itemPath === "/"
                    ? pathname === "/"
                    : pathname.startsWith(itemPath);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-brand-600 font-semibold text-ink-inverse shadow-card"
                          : "text-ink-muted hover:bg-brand-50 hover:text-brand-700",
                      )}
                    >
                      <NavIcon href={itemPath} active={active} />
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

function NavIcon({ href, active }: { href: string; active: boolean }) {
  const iconClass = cn("size-4 shrink-0", active ? "text-brand-100" : "text-ink-subtle");

  if (href === "/") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass} aria-hidden><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  if (href.includes("approval") || href.includes("verification") || href.includes("request")) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass} aria-hidden><path d="M9 11 11 13 15 9" /><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 3h8M8 17h8" /></svg>;
  if (href.includes("report")) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass} aria-hidden><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v5M12 17h.01" /></svg>;
  if (href.includes("user")) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass} aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  if (href.includes("audit")) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass} aria-hidden><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></svg>;
  if (href.includes("city") || href.includes("localit")) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass} aria-hidden><path d="M4 21V5l8-2 8 2v16M8 8h1M15 8h1M8 12h1M15 12h1M8 16h1M15 16h1" /><path d="M11 21v-4h2v4" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass} aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}
