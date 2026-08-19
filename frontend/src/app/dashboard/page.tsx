import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockListings } from "@/lib/api/mockdata";
import { mockConversations } from "@/lib/api/mockconversations";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export default function Page() {
  const mine = mockListings.slice(0, 2);
  const unread = mockConversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Overview
        </h1>
        <Link href={routes.post} className={buttonStyles()}>
          Post a room
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active listings" value={String(mine.length)} />
        <Stat label="Unread messages" value={String(unread)} />
        <Stat
          label="Views this week"
          value={String(mine.reduce((sum, l) => sum + l.viewCount, 0))}
        />
      </div>

      {/*
        Renewal prompts start at day 21. Stale listings are the single biggest
        threat to seeker trust, so this sits at the top of the dashboard
        rather than waiting for an email to be noticed.
      */}
      <section className="rounded-card border border-warning/20 bg-warning-soft p-4">
        <p className="text-sm font-medium text-warning">
          One listing expires in 9 days
        </p>
        <p className="mt-1 text-sm text-warning">
          Renew it if the room is still free, or mark it taken so seekers stop
          messaging you about it.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Your listings</h2>
          <Link
            href={routes.myListings}
            className="text-sm text-brand-700 hover:text-brand-800"
          >
            See all
          </Link>
        </div>

        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {mine.map((listing) => (
            <li key={listing.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={routes.myListing(listing.id)}
                  className="truncate text-sm font-medium text-ink hover:underline"
                >
                  {listing.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {formatRupees(listing.rentPaise)}/month ·{" "}
                  {listing.locality.name} · {listing.viewCount} views
                </p>
              </div>
              <Badge tone="success" dot>
                Active
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
