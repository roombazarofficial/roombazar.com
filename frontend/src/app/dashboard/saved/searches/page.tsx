import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptystate";
import { getSavedSearches } from "@/lib/api/saved";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const searches = await getSavedSearches();

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

      {searches.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No saved searches"
          description="Set some filters on a search, then save it to get told about new matches."
          action={
            <Link href={routes.rooms} className={buttonStyles()}>
              Start a search
            </Link>

          }
        />

      ) : (
        <ul className="mt-6 space-y-3">
          {searches.map((search) => (
            <li
              key={search.id}
              className="rounded-card border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{search.label}</p>

                  <p className="mt-0.5 text-xs text-ink-muted">
                    Alerts: {search.notifyFrequency}
                  </p>

                </div>

                <Badge tone="neutral">{search.notifyFrequency}</Badge>

              </div>

            </li>

          ))}
        </ul>

      )}
    </div>

  );
}
