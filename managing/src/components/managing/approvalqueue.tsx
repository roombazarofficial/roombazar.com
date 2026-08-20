"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/emptystate";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRupees } from "@/lib/format/rupees";
import { cn } from "@/lib/utils/classnames";
import {
  approveListing,
  approveMany,
  getApprovalQueue,
  rejectListing,
  type ApprovalRow,
} from "@/lib/api/superadmin";

/**
 * The approval queue — every room waiting to be hosted.
 *
 * Ordered oldest first by the API, and the UI keeps that order rather than
 * offering a sort. A listing that has waited three days must not be overtaken
 * by one submitted this morning, and a sortable column is how that starts
 * happening.
 */
export function ApprovalQueue() {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState<ApprovalRow | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const page = await getApprovalQueue();
      setRows(page.items);
      setSelected(new Set());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);

    try {
      await action();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return <p className="text-sm text-ink-muted">Loading the queue…</p>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-card border border-danger/20 bg-danger-soft p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing waiting for approval"
          description="Every submitted room has been decided. New submissions appear here immediately."
        />
      ) : (
        <>
          {/*
            Bulk approve exists because most submissions are unremarkable and
            reviewing them one modal at a time is what makes a queue back up.
            Rejection is deliberately never bulk: it needs a reason per listing.
          */}
          {selected.size > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 p-4">
              <p className="text-sm font-medium text-brand-700">
                {selected.size} selected
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  loading={busy}
                  onClick={() => act(() => approveMany([...selected]))}
                >
                  Approve selected
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.listing.id}
                className="rounded-card border border-line bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    label=""
                    checked={selected.has(row.listing.id)}
                    onChange={() => toggle(row.listing.id)}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/approvals/${row.listing.id}`}
                          className="text-sm font-medium text-ink hover:underline"
                        >
                          {row.listing.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {formatRupees(row.listing.rentPaise)}/month ·{" "}
                          {row.listing.locality?.name ?? "Unknown locality"} ·{" "}
                          {row.ownerName}
                        </p>
                      </div>

                      {/*
                        Wait time is the number that decides whether the queue
                        is healthy, so it is the one thing shown in colour.
                      */}
                      <span
                        className={cn(
                          "shrink-0 text-xs font-medium",
                          row.waitingHours >= 24
                            ? "text-danger"
                            : row.waitingHours >= 8
                              ? "text-warning"
                              : "text-ink-subtle",
                        )}
                      >
                        waiting {row.waitingHours}h
                      </span>
                    </div>

                    {row.flags.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {row.flags.map((flag) => (
                          <li key={flag}>
                            <Badge tone="warning">{flag}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        loading={busy}
                        onClick={() => act(() => approveListing(row.listing.id))}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setRejecting(row);
                          setReason("");
                        }}
                      >
                        Reject
                      </Button>
                      <Link
                        href={`/approvals/${row.listing.id}`}
                        className="rounded-control px-3 py-2 text-sm text-ink-muted hover:text-ink"
                      >
                        Review in full
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        title="Reject this listing"
        description="The owner sees this reason word for word, so tell them what to fix."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={reason.trim().length < 10}
              loading={busy}
              onClick={() => {
                const target = rejecting;
                setRejecting(null);
                if (target) {
                  void act(() => rejectListing(target.listing.id, reason));
                }
              }}
            >
              Reject
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason"
          placeholder="The photos show a different room from the one described."
          maxLength={500}
          showCount
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          hint="At least 10 characters."
        />
      </Modal>
    </div>
  );
}
