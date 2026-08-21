"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);

    try {
      await logout();
    } catch {
      // Even a failed call should get them off the console: the cookie may
      // already be invalid, which is often why someone is signing out.
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-control border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
    >
      <span aria-hidden>↪</span>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
