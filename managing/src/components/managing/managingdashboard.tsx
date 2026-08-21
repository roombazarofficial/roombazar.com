"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const listingTotal = Object.values(listings).reduce((sum, value) => sum + (value ?? 0), 0);
  const activeShare = listingTotal ? Math.round(((listings.active ?? 0) / listingTotal) * 100) : 0;
  const pendingShare = listingTotal ? Math.round(((listings.pendingapproval ?? 0) / listingTotal) * 100) : 0;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Operations overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Good morning, Super admin</h1>
          <p className="mt-1 text-sm text-ink-muted">Here is what needs your attention across RoomBazar today.</p>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-muted">
          Updated just now
        </span>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Awaiting approval" value={needsAction.pendingApproval} detail="Rooms in review queue" href="/approvals" tone="brand" />
        <MetricCard label="Open reports" value={needsAction.openReports} detail="Require moderation" href="/reports" tone="warning" />
        <MetricCard label="Oldest wait" value={`${needsAction.oldestPendingHours}h`} detail="Approval queue age" href="/approvals" tone={behind ? "danger" : "success"} />
        <MetricCard label="Total listings" value={listingTotal} detail={`${activeShare}% currently hosted`} href="/listings" tone="info" />
      </section>

      {behind && (
        <Link href="/approvals" className="flex items-center justify-between gap-4 rounded-card border border-warning/20 bg-warning-soft px-4 py-3 text-sm text-warning transition-colors hover:border-warning/40">
          <span><strong>Queue attention needed.</strong> A room has been waiting over a day.</span>
          <span className="font-semibold">Review now →</span>
        </Link>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Listing health</h2>
              <p className="mt-1 text-sm text-ink-muted">Current inventory across every listing state.</p>
            </div>
            <Link href="/listings" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
          </div>

          <div className="mt-7 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <div
              className="relative flex size-44 shrink-0 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(var(--color-brand-600) 0 ${activeShare}%, var(--color-warning) ${activeShare}% ${activeShare + pendingShare}%, var(--color-surface-sunken) ${activeShare + pendingShare}% 100%)` }}
            >
              <div className="flex size-28 flex-col items-center justify-center rounded-full bg-surface">
                <span className="text-3xl font-bold tabular-nums text-ink">{listingTotal}</span>
                <span className="text-xs text-ink-muted">total rooms</span>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-x-8 gap-y-4">
              <Legend label="Hosted" value={listings.active ?? 0} color="bg-brand-600" href="/listings?status=active" />
              <Legend label="Pending" value={listings.pendingapproval ?? 0} color="bg-warning" href="/listings?status=pendingapproval" />
              <Legend label="Rejected" value={listings.rejected ?? 0} color="bg-danger" href="/listings?status=rejected" />
              <Legend label="Suspended" value={listings.suspended ?? 0} color="bg-ink-subtle" href="/listings?status=suspended" />
              <Legend label="Taken" value={listings.taken ?? 0} color="bg-success" href="/listings?status=taken" />
              <Legend label="Expired" value={listings.expired ?? 0} color="bg-line-strong" href="/listings?status=expired" />
            </div>
          </div>
        </section>

        <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Team access</h2>
              <p className="mt-1 text-sm text-ink-muted">People who can operate the console.</p>
            </div>
            <Link href="/users" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Manage →</Link>
          </div>
          <div className="mt-6 space-y-5">
            <TeamRow label="Super admins" value={staff.superAdmins} color="bg-brand-600" href="/users?role=superadmin" />
            <TeamRow label="Admins" value={staff.admins} color="bg-info" href="/users?role=admin" />
            <TeamRow label="Moderators" value={staff.moderators} color="bg-success" href="/users?role=moderator" />
          </div>
          <Link href="/audit-log" className="mt-7 flex items-center justify-between border-t border-line pt-4 text-sm font-medium text-ink-muted hover:text-brand-600">
            <span>Review recent audit activity</span><span>→</span>
          </Link>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Quick actions</h2>
            <p className="mt-1 text-sm text-ink-muted">Jump into the workflows operators use most.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionCard label="Review approvals" detail="Work the oldest rooms first" href="/approvals" icon="✓" />
          <ActionCard label="Resolve reports" detail="Keep the marketplace trusted" href="/reports" icon="!" />
          <ActionCard label="Manage listings" detail="Edit, suspend or remove" href="/listings" icon="⌂" />
          <ActionCard label="Manage reference data" detail="Cities, localities and amenities" href="/cities" icon="+" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  detail: string;
  href: string;
  tone: "brand" | "warning" | "danger" | "success" | "info";
}) {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
  };

  return (
    <Link
      href={href}
      className="rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-raised"
    >
      <span className={`inline-flex rounded-control px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</span>
      <p className="mt-4 text-3xl font-bold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{detail}</p>
    </Link>
  );
}

function Legend({ label, value, color, href }: { label: string; value: number; color: string; href: string }) {
  return <Link href={href} className="flex items-center justify-between gap-3 text-sm hover:text-brand-600"><span className="flex items-center gap-2 text-ink-muted"><span className={`size-2.5 rounded-full ${color}`} />{label}</span><strong className="tabular-nums text-ink">{value}</strong></Link>;
}

function TeamRow({ label, value, color, href }: { label: string; value: number; color: string; href: string }) {
  return <Link href={href} className="flex items-center justify-between gap-4 text-sm"><span className="flex items-center gap-2 text-ink-muted"><span className={`size-2.5 rounded-full ${color}`} />{label}</span><span className="font-bold tabular-nums text-ink">{value}</span></Link>;
}

function ActionCard({ label, detail, href, icon }: { label: string; detail: string; href: string; icon: string }) {
  return <Link href={href} className="group flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition-all hover:border-brand-200 hover:shadow-card"><span className="flex size-10 items-center justify-center rounded-control bg-brand-50 text-lg font-bold text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-ink-inverse">{icon}</span><span className="min-w-0"><strong className="block text-sm text-ink">{label}</strong><span className="mt-0.5 block truncate text-xs text-ink-muted">{detail}</span></span><span className="ml-auto text-lg text-ink-subtle group-hover:text-brand-600">→</span></Link>;
}
