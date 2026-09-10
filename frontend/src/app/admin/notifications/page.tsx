"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ApiRequestError } from "@/lib/api/client";
import {
  getNotificationStatus,
  searchUsers,
  sendAdminNotification,
  type AdminUserResult,
} from "@/lib/api/notifications";
import type {
  NotificationType,
  SendNotificationResult,
} from "@/types/notification";

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "SYSTEM_NOTIFICATION", label: "System update" },
  { value: "LISTING_UPDATE", label: "Listing update" },
  { value: "NEW_MATCHING_LISTING", label: "New matching listing" },
  { value: "MARKETING", label: "Marketing" },
];

type Target = "all" | "user" | "users";

export default function Page() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<NotificationType>("SYSTEM_NOTIFICATION");
  const [target, setTarget] = useState<Target>("all");
  const [selected, setSelected] = useState<AdminUserResult[]>([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminUserResult[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendNotificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    enabled: boolean;
    reachableUsers: number;
  } | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getNotificationStatus()
      .then(setStatus)
      .catch((err) => {
        if (err instanceof ApiRequestError && [401, 403, 404].includes(err.status)) {
          setForbidden(true);
        }
      });
  }, []);

  useEffect(() => {
    if (target === "all" || query.trim().length === 0) {
      setResults([]);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      searchUsers(query).then(setResults).catch(() => setResults([]));
    }, 300);
  }, [query, target]);

  const canSend = useMemo(() => {
    if (title.trim().length < 3 || body.trim().length < 3) return false;
    if (target === "user") return selected.length === 1;
    if (target === "users") return selected.length >= 1;
    return true;
  }, [title, body, target, selected]);

  function addUser(user: AdminUserResult) {
    setSelected((current) => {
      if (current.some((u) => u.id === user.id)) return current;
      if (target === "user") return [user];
      return [...current, user];
    });
    setQuery("");
    setResults([]);
  }

  function removeUser(id: string) {
    setSelected((current) => current.filter((u) => u.id !== id));
  }

  async function doSend() {
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        type,
        url: url.trim() || undefined,
        target,
        userIds: target === "all" ? undefined : selected.map((u) => u.id),
        confirmAll: target === "all" ? true : undefined,
      };
      const res = await sendAdminNotification(payload);
      setResult(res);
      setTitle("");
      setBody("");
      setUrl("");
      setSelected([]);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(
          err.status === 403 || err.status === 404
            ? "You do not have permission to send notifications."
            : err.body.message || "Could not send the notification.",
        );
      } else {
        setError("Could not send the notification. Try again.");
      }
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    if (target === "all") {
      setConfirmOpen(true);
      return;
    }
    void doSend();
  }

  if (forbidden) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-ink">Send notification</h1>
        <p className="mt-3 text-sm text-danger">
          This area is restricted to super admins.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Send notification
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Push a message to RoomBazar users&rsquo; browsers.
          </p>
        </div>
        <Link
          href="/admin/notifications/history"
          className="shrink-0 text-sm text-brand-700 hover:underline"
        >
          History
        </Link>
      </header>

      {status && !status.enabled && (
        <div className="mt-4 rounded-card border border-warning/30 bg-warning-soft p-3 text-sm text-warning">
          Firebase is not configured on the backend yet. Add the Firebase
          environment variables to Render and redeploy before sending.
        </div>
      )}
      {status && status.enabled && (
        <p className="mt-4 text-xs text-ink-subtle">
          {status.reachableUsers} user(s) currently have at least one registered
          device.
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-card border border-success/30 bg-success-soft p-4 text-sm text-success">
          <p className="font-semibold">Notification sent</p>
          <ul className="mt-1 space-y-0.5">
            <li>Recipients (devices): {result.recipients}</li>
            <li>Successful: {result.successful}</li>
            <li>Failed: {result.failed}</li>
            <li>Invalid tokens removed: {result.invalidTokensRemoved}</li>
          </ul>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-card border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          hint={`${title.length}/120`}
          required
        />

        <Textarea
          label="Message"
          value={body}
          maxLength={500}
          showCount
          onChange={(e) => setBody(e.target.value)}
          required
        />

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">
            Recipients
          </legend>
          <div className="space-y-1.5">
            {(
              [
                ["all", "All users"],
                ["user", "Specific user"],
                ["users", "Multiple users"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-2 text-sm text-ink"
              >
                <input
                  type="radio"
                  name="target"
                  className="accent-brand-600"
                  checked={target === value}
                  onChange={() => {
                    setTarget(value);
                    setSelected([]);
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {target !== "all" && (
          <div>
            <Input
              label="Find users"
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {results.length > 0 && (
              <ul className="mt-2 divide-y divide-line rounded-card border border-line bg-surface">
                {results.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => addUser(user)}
                      className="flex w-full items-center justify-between gap-3 p-2.5 text-left text-sm hover:bg-surface-muted"
                    >
                      <span>
                        <span className="font-medium text-ink">
                          {user.name}
                        </span>
                        <span className="ml-2 text-ink-muted">
                          {user.email}
                        </span>
                      </span>
                      <Badge tone="neutral">{user.trustLevel}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selected.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => removeUser(user.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700"
                  >
                    {user.name} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Input
          label="Destination URL (optional)"
          placeholder="/dashboard or https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <Select
          label="Notification type"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as NotificationType)}
        />

        <Button type="submit" loading={sending} disabled={!canSend}>
          Send notification
        </Button>
      </form>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Send to all users?"
        description="You are about to send this notification to all eligible RoomBazar users."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" loading={sending} onClick={() => void doSend()}>
              Send to everyone
            </Button>
          </>
        }
      />
    </div>
  );
}
