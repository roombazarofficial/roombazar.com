"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptystate";
import {
  decideLocalityRequest,
  decideVerification,
  getLocalityRequests,
  getVerificationRequests,
  type LocalityRequest,
  type VerificationRequest,
} from "@/lib/api/superadmin";

type QueueKind = "verification" | "locality";
type QueueRow = VerificationRequest | LocalityRequest;

export function RequestQueue({ kind }: { kind: QueueKind }) {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(
        kind === "verification"
          ? await getVerificationRequests()
          : await getLocalityRequests(),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load requests");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusyId(id);
    setError(null);
    try {
      const note = `${decision === "approved" ? "Approved" : "Rejected"} by super admin`;
      if (kind === "verification") {
        await decideVerification(id, decision, note);
      } else {
        await decideLocalityRequest(id, decision, note);
      }
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update request");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-card border border-danger/20 bg-danger-soft p-3 text-sm text-danger">
          {error}
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          description="New requests will appear here automatically."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-line text-left text-xs text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Account or city</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => {
                const verification = "kind" in row;
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium text-ink">
                      {verification ? row.kind : row.name}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {verification
                        ? `${row.user.name} · ${row.user.email}`
                        : row.city?.name ?? "Unknown city"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {new Date(row.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          loading={busyId === row.id}
                          onClick={() => void decide(row.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busyId === row.id}
                          onClick={() => void decide(row.id, "rejected")}
                        >
                          Reject
                        </Button>
                        {verification && <Badge tone="warning">{row.status}</Badge>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
