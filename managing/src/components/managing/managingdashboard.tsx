"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/classnames";
import { getDashboard, type DashboardSummary } from "@/lib/api/superadmin";

/**
 * Console overview.
 *
 * Leads with what is waiting on a human rather than with totals. How many rooms
 * have ever been listed tells an operator nothing about what to do next; how
 * long the oldest submission has been waiting tells them exactly that.
 */
export function ManagingDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "Could not load"),
      );
  }, []);

  if (error) {
    /*
      The API answers a wrong-role request with 404 rather than 403, so that a
      probing client cannot confirm these routes exist. Correct for the API,
      but "Route not found" is a useless thing to show an operator — so the
      likely cause is named here instead of echoed.
    */
    const likelyRole = /not found/i.test(error);

    return (
      <div className="rounded-card border border-danger/20 bg-danger-soft p-4">
        <p className="text-sm font-medium text-danger">
          {likelyRole
            ? "This account cannot open the console"
            : "Could not load the console"}
        </p>

        <p className="mt-1 text-sm text-danger">
          {likelyRole
            ? "You are signed in, but the account does not have the super admin role. Sign out and sign in with one that does."
            : error}
        </p>

        <a
          href="/login"
          className="mt-3 inline-block text-sm font-medium text-danger underline"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  if (!data) return <p className="text-sm text-ink-muted">Loading…</p>;

  const { needsAction, listings, staff } = data;
  const behind = needsAction.oldestPendingHours >= 24;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-base font-semibold text-ink">
          Waiting on you
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Tile
            label="Rooms awaiting approval"
            value={needsAction.pendingApproval}
            href="/approvals"
            urgent={needsAction.pendingApproval > 0}
          />
          <Tile
            label="Open reports"
            value={needsAction.openReports}
            href="/reports"
            urgent={needsAction.openReports > 2}
          />
          <Tile
            label="Oldest wait (hours)"
            value={needsAction.oldestPendingHours}
            href="/approvals"
            urgent={behind}
          />
        </div>

        {behind && (
          <p className="mt-3 rounded-control bg-warning-soft px-3 py-2 text-sm text-warning">
            A room has been waiting over a day. Owners who wait this long stop
            posting, and the supply side is the harder one to rebuild.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink">Listings</h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Tile label="Hosted" value={listings.active ?? 0} href="/listings?status=active" />
          <Tile label="Pending" value={listings.pendingapproval ?? 0} href="/listings?status=pendingapproval" />
          <Tile label="Rejected" value={listings.rejected ?? 0} href="/listings?status=rejected" />
          <Tile label="Suspended" value={listings.suspended ?? 0} href="/listings?status=suspended" />
          <Tile label="Taken" value={listings.taken ?? 0} href="/listings?status=taken" />
          <Tile label="Expired" value={listings.expired ?? 0} href="/listings?status=expired" />
          <Tile label="Paused" value={listings.paused ?? 0} href="/listings?status=paused" />
          <Tile label="Drafts" value={listings.draft ?? 0} href="/listings?status=draft" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink">Staff</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Super admins" value={staff.superAdmins} href="/users?role=superadmin" />
          <Tile label="Admins" value={staff.admins} href="/users?role=admin" />
          <Tile label="Moderators" value={staff.moderators} href="/users?role=moderator" />
        </div>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  href,
  urgent = false,
}: {
  label: string;
  value: number;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-raised"
    >
      <p className="text-xs text-ink-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-3xl font-semibold tabular-nums",
          urgent ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </p>
    </Link>
  );
}
