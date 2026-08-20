"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/emptystate";
import { formatRupees } from "@/lib/format/rupees";
import {
  deleteListing,
  getListings,
  reinstateListing,
  suspendListing,
  type AdminListingRow,
} from "@/lib/api/superadmin";

const statuses = [
  { value: "", label: "All statuses" },
  { value: "pendingapproval", label: "Pending approval" },
  { value: "active", label: "Hosted" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "taken", label: "Taken" },
  { value: "expired", label: "Expired" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Draft" },
];

type Pending = { row: AdminListingRow; kind: "suspend" | "delete" } | null;

/**
 * Every listing on the platform, any status.
 *
 * Status changes are not made from this table — approve and reject live in the
 * approvals screen, which enforces the lifecycle and records the decision.
 * What is here is what an operator needs when something has already gone wrong:
 * find the room, take it down, or remove it.
 */
export function ListingsTable({ initialStatus = "" }: { initialStatus?: string }) {
  const [rows, setRows] = useState<AdminListingRow[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const page = await getListings({
        ...(status ? { status } : {}),
        ...(query ? { query } : {}),
        pageSize: 50,
      });

      setRows(page.items);
      setTotal(page.totalItems);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);

    try {
      await action();
      setPending(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select
          label="Status"
          options={statuses}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-52"
        />

        <div className="flex items-end gap-2">
          <Input
            label="Search"
            placeholder="Title or slug"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void load();
            }}
          />
          <Button variant="secondary" onClick={() => void load()}>
            Search
          </Button>
        </div>

        <p className="ml-auto text-sm text-ink-muted">{total} listings</p>
      </div>

      {error && (
        <div className="mb-4 rounded-card border border-danger/20 bg-danger-soft p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No listings match"
          description="Try a different status or clear the search."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line text-left text-xs text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Listing</th>
                <th scope="col" className="px-4 py-3 font-medium">Owner</th>
                <th scope="col" className="px-4 py-3 font-medium">Rent</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ listing, ownerName, ownerId }) => (
                <tr key={listing.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-xs text-ink-subtle">
                      {listing.locality?.name ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${ownerId}`}
                      className="text-ink-muted hover:text-ink hover:underline"
                    >
                      {ownerName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">
                    {formatRupees(listing.rentPaise)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={listing.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {listing.status === "suspended" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={busy}
                          onClick={() =>
                            act(() => reinstateListing(listing.id))
                          }
                        >
                          Reinstate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPending({
                              row: { listing, ownerName, ownerId },
                              kind: "suspend",
                            });
                            setReason("");
                          }}
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() =>
                          setPending({
                            row: { listing, ownerName, ownerId },
                            kind: "delete",
                          })
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title={
          pending?.kind === "delete"
            ? "Delete this listing?"
            : "Suspend this listing?"
        }
        description={
          pending?.kind === "delete"
            ? "It disappears everywhere. The row is kept in the database so an audit trail survives, but nothing in the product will show it."
            : "It comes down immediately and seekers can no longer message about it."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={busy}
              disabled={
                pending?.kind === "suspend" && reason.trim().length < 10
              }
              onClick={() => {
                if (!pending) return;

                void act(() =>
                  pending.kind === "delete"
                    ? deleteListing(pending.row.listing.id)
                    : suspendListing(pending.row.listing.id, reason),
                );
              }}
            >
              {pending?.kind === "delete" ? "Delete" : "Suspend"}
            </Button>
          </>
        }
      >
        {pending?.kind === "suspend" && (
          <Textarea
            label="Reason"
            hint="At least 10 characters. Recorded in the audit log."
            maxLength={500}
            showCount
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        )}
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge tone="success" dot>Hosted</Badge>;
    case "pendingapproval":
      return <Badge tone="brand">Pending</Badge>;
    case "rejected":
      return <Badge tone="warning">Rejected</Badge>;
    case "suspended":
      return <Badge tone="danger">Suspended</Badge>;
    case "taken":
      return <Badge tone="neutral">Taken</Badge>;
    case "expired":
      return <Badge tone="warning">Expired</Badge>;
    default:
      return <Badge tone="neutral">{status}</Badge>;
  }
}
