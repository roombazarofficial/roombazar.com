import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

const searches = [
  {
    id: "s-1",
    label: "Single room in Koramangala under 15,000",
    href: "/rooms/bengaluru/koramangala?type=singleroom&maxrent=15000",
    frequency: "Daily",
    newCount: 3,
  },
  {
    id: "s-2",
    label: "Owner-listed 1BHK in Indiranagar",
    href: "/rooms/bengaluru/indiranagar?type=bhk1&by=owner",
    frequency: "Instant",
    newCount: 0,
  },
];

/**
 * Saved searches are the main retention loop: a seeker who saves one and gets
 * a matching room the next morning returns without any paid acquisition.
 * See docs/01-data-model.md.
 */
export default function Page() {
  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Saved searches
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          We will tell you when a new room matches.
        </p>
      </header>

      <ul className="mt-6 space-y-3">
        {searches.map((search) => (
          <li
            key={search.id}
            className="rounded-card border border-line bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={search.href}
                  className="text-sm font-medium text-ink hover:underline"
                >
                  {search.label}
                </Link>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Alerts: {search.frequency}
                </p>
              </div>

              {search.newCount > 0 && (
                <Badge tone="brand">{search.newCount} new</Badge>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href={search.href}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                View results
              </Link>
              <Button size="sm" variant="ghost">
                Alert settings
              </Button>
              <Button size="sm" variant="ghost" className="text-danger">
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href={routes.rooms}
        className={buttonStyles({ variant: "secondary", className: "mt-6" })}
      >
        Create a new search
      </Link>
    </div>
  );
}
