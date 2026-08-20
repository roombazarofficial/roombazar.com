"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/emptystate";
import { getAuditLog, type AuditEntry } from "@/lib/api/superadmin";

/**
 * The append-only record of everything done in this console.
 *
 * There is no filter that hides entries and no endpoint that edits them. An
 * audit log an operator can curate is not an audit log, so the only control
 * offered is how far back to read.
 */
export function AuditLogTable() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLog(200)
      .then(setEntries)
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "Could not load"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="rounded-card border border-danger/20 bg-danger-soft p-4">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nothing recorded yet"
        description="Approvals, role changes and reference-data edits all appear here."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-card border border-line bg-surface p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={toneFor(entry.action)}>{entry.action}</Badge>
              <span className="text-sm font-medium text-ink">
                {entry.moderatorName}
              </span>
            </div>

            <time
              dateTime={entry.createdAt}
              className="text-xs text-ink-subtle"
            >
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(entry.createdAt))}
            </time>
          </div>

          <p className="mt-1 text-xs text-ink-muted">
            {entry.targetType} · {entry.targetId}
          </p>

          {entry.note && (
            <p className="mt-2 text-sm text-ink-muted">{entry.note}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Destructive actions read differently at a glance from routine ones. */
function toneFor(action: string) {
  if (action.startsWith("delete") || action === "restrictuser") return "danger";
  if (action.startsWith("reject") || action.startsWith("suspend")) return "warning";
  if (action.startsWith("approve") || action.startsWith("reinstate")) return "success";
  if (action === "changerole") return "brand";
  return "neutral";
}
