"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ApiRequestError } from "@/lib/api/client";
import { getNotificationDetail } from "@/lib/api/notifications";
import type { NotificationLogDetail } from "@/types/notification";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [log, setLog] = useState<NotificationLogDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotificationDetail(id)
      .then(setLog)
      .catch((err) => {
        setError(
          err instanceof ApiRequestError && [401, 403, 404].includes(err.status)
            ? "Not found or not permitted."
            : "Could not load this notification.",
        );
      });
  }, [id]);

  if (error) {
    return (
      <div className="max-w-xl">
        <BackLink />
        <p className="mt-4 text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="max-w-xl">
        <BackLink />
        <p className="mt-4 text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <BackLink />
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
        {log.title}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">{log.body}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-card border border-line bg-surface p-4 text-sm">
        <Row label="Type" value={log.type} />
        <Row label="Audience" value={log.targetType} />
        <Row label="Sent by" value={log.sentByName ?? "Unknown"} />
        <Row label="Date" value={new Date(log.createdAt).toLocaleString()} />
        <Row label="Recipients (devices)" value={String(log.recipientCount)} />
        <Row label="Successful" value={String(log.successCount)} />
        <Row label="Failed" value={String(log.failureCount)} />
        <Row
          label="Invalid tokens removed"
          value={String(log.invalidRemoved)}
        />
        <Row label="Destination" value={log.url ?? "—"} />
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-subtle">
            Status
          </dt>
          <dd className="mt-1">
            <Badge
              tone={
                log.status === "sent"
                  ? "success"
                  : log.status === "partial"
                    ? "warning"
                    : "danger"
              }
            >
              {log.status}
            </Badge>
          </dd>
        </div>
      </dl>

      {log.recipients.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Recipients</h2>
          <ul className="mt-2 divide-y divide-line rounded-card border border-line bg-surface text-sm">
            {log.recipients.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 p-2.5">
                <span className="font-medium text-ink">{r.name}</span>
                <span className="text-ink-muted">{r.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/notifications/history"
      className="text-sm text-brand-700 hover:underline"
    >
      ← Notification history
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-subtle">
        {label}
      </dt>
      <dd className="mt-1 break-words text-ink">{value}</dd>
    </div>
  );
}
