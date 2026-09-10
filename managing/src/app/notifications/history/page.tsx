"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/emptystate";
import { Button } from "@/components/ui/button";
import {
  getNotificationHistory,
  type NotificationLog,
  type Paged,
} from "@/lib/api/superadmin";

const audienceLabel: Record<string, string> = {
  all: "All users",
  user: "One user",
  users: "Multiple users",
};

function statusTone(status: string) {
  if (status === "sent") return "success" as const;
  if (status === "partial") return "warning" as const;
  return "danger" as const;
}

export default function Page() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<NotificationLog> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNotificationHistory(page)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Notification history
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Every notification sent from this console.
          </p>
        </div>
        <Link
          href="/notifications"
          className="text-sm text-brand-700 hover:underline"
        >
          Send new
        </Link>
      </header>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}

      {!loading && (!data || data.items.length === 0) && (
        <EmptyState
          title="No notifications sent yet"
          description="Notifications you send from the console will be listed here."
        />
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-control border border-line">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-surface-muted text-left text-2xs uppercase tracking-wide text-ink-subtle">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Audience</th>
                  <th className="p-3 text-right">Sent</th>
                  <th className="p-3 text-right">OK</th>
                  <th className="p-3 text-right">Failed</th>
                  <th className="p-3">By</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-muted">
                    <td className="p-3">
                      <Link
                        href={`/notifications/history/${log.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {log.title}
                      </Link>
                    </td>
                    <td className="p-3 text-ink-muted">{log.type}</td>
                    <td className="p-3 text-ink-muted">
                      {audienceLabel[log.targetType] ?? log.targetType}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {log.recipientCount}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {log.successCount}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {log.failureCount}
                    </td>
                    <td className="p-3 text-ink-muted">{log.sentByName}</td>
                    <td className="p-3 text-ink-muted">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Badge tone={statusTone(log.status)}>{log.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-ink-muted">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
