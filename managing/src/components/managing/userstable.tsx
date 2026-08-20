"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/emptystate";
import {
  deleteUser,
  getUsers,
  setUserRole,
  setUserTrustLevel,
  type AdminUser,
} from "@/lib/api/superadmin";

const roles = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super admin" },
];

const trustLevels = [
  { value: "new", label: "New" },
  { value: "verified", label: "Verified" },
  { value: "trusted", label: "Trusted" },
  { value: "restricted", label: "Restricted" },
];

type Dialog =
  | { kind: "role"; user: AdminUser }
  | { kind: "trust"; user: AdminUser }
  | { kind: "delete"; user: AdminUser }
  | null;

/**
 * User administration.
 *
 * Role and trust changes both require a written reason. They alter what someone
 * can do to other people's data, and the reason is what makes the audit row
 * answerable months later — "changerole" alone explains nothing.
 */
export function UsersTable({ initialRole = "" }: { initialRole?: string }) {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [role, setRole] = useState(initialRole);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const page = await getUsers({
        ...(role ? { role } : {}),
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
  }, [query, role]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);

    try {
      await action();
      setDialog(null);
      setReason("");
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
          label="Role"
          options={[{ value: "", label: "All roles" }, ...roles]}
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="w-48"
        />

        <div className="flex items-end gap-2">
          <Input
            label="Search"
            placeholder="Name or email"
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

        <p className="ml-auto text-sm text-ink-muted">{total} users</p>
      </div>

      {error && (
        <div className="mb-4 rounded-card border border-danger/20 bg-danger-soft p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="No users match" description="Try another filter." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line text-left text-xs text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 font-medium">Trust</th>
                <th scope="col" className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((user) => (
                <tr key={user.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${user.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {user.name || "(no name)"}
                    </Link>
                    {user.deletedAt && (
                      <Badge tone="neutral" className="ml-2">Deleted</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={user.role === "superadmin" ? "danger" : "neutral"}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        user.trustLevel === "restricted" ? "danger" : "neutral"
                      }
                    >
                      {user.trustLevel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDialog({ kind: "role", user });
                          setValue(user.role);
                          setReason("");
                        }}
                      >
                        Role
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDialog({ kind: "trust", user });
                          setValue(user.trustLevel);
                          setReason("");
                        }}
                      >
                        Trust
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => setDialog({ kind: "delete", user })}
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
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={
          dialog?.kind === "role"
            ? `Change role for ${dialog.user.name}`
            : dialog?.kind === "trust"
              ? `Change trust level for ${dialog.user.name}`
              : dialog
                ? `Delete ${dialog.user.name}?`
                : ""
        }
        description={
          dialog?.kind === "delete"
            ? "Their listings and personal fields go. Messages that are evidence in an open report are anonymised rather than removed."
            : "Recorded in the audit log with the reason you give."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={dialog?.kind === "delete" ? "danger" : "primary"}
              loading={busy}
              disabled={dialog?.kind !== "delete" && reason.trim().length < 5}
              onClick={() => {
                if (!dialog) return;

                void act(() => {
                  if (dialog.kind === "role") {
                    return setUserRole(dialog.user.id, value, reason);
                  }
                  if (dialog.kind === "trust") {
                    return setUserTrustLevel(dialog.user.id, value, reason);
                  }
                  return deleteUser(dialog.user.id);
                });
              }}
            >
              {dialog?.kind === "delete" ? "Delete" : "Save"}
            </Button>
          </>
        }
      >
        {dialog && dialog.kind !== "delete" && (
          <div className="space-y-4">
            <Select
              label={dialog.kind === "role" ? "Role" : "Trust level"}
              options={dialog.kind === "role" ? roles : trustLevels}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <Textarea
              label="Reason"
              hint="At least 5 characters."
              maxLength={500}
              showCount
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
