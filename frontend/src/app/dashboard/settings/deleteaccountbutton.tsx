"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/constants/routes";
import { useAuthUi } from "@/store/authuistore";
import { deleteAccountClient } from "@/lib/api/users";
import { unregisterToken } from "@/lib/api/notifications";
import { getExistingToken, revokeToken } from "@/lib/firebase/messaging";

export function DeleteAccountButton() {
  const router = useRouter();
  const setUser = useAuthUi((state) => state.setUser);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (busy) return;
    const confirmed = window.confirm(
      "Delete your account? This removes your listings and photos within 30 days and can't be undone from here.",
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      // Drop this browser's push subscription before the account goes away —
      // otherwise a future account created on the same browser inherits a
      // stale PushManager subscription tied to this one and push setup fails.
      try {
        const existing = await getExistingToken();
        if (existing) await unregisterToken(existing.token);
        await revokeToken();
      } catch {
        /* best effort — proceed with deletion regardless */
      }

      await deleteAccountClient();
      setUser(null);
      router.push(routes.home);
      router.refresh();
    } catch (error) {
      console.error("[settings] account deletion failed", error);
      window.alert("Something went wrong deleting your account. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="mt-3 rounded-control border border-danger/30 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
    >
      {busy ? "Deleting…" : "Delete my account"}
    </button>
  );
}
