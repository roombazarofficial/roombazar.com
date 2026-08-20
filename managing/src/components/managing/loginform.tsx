"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, me, AuthError } from "@/lib/api/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await login(email.trim(), password);

      /*
        Signing in is not the same as being allowed in. A perfectly valid
        account with the wrong role would otherwise land on a dashboard full of
        "route not found", which reads as a broken console rather than a
        permissions problem.
      */
      const user = await me();

      if (!user) {
        setError("Signed in, but the session could not be read back.");
        setBusy(false);
        return;
      }

      if (user.role !== "superadmin") {
        setError(
          `This console is for super admins. ${user.email} is signed in as "${user.role}".`,
        );
        setBusy(false);
        return;
      }

      // Resume whatever they were trying to reach before being sent here.
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof AuthError
          ? caught.message
          : "Could not reach the API. Is the backend running?",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="username"
        autoFocus
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {error && (
        <div className="rounded-card border border-danger/20 bg-danger-soft p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={busy}
        disabled={!email.trim() || !password}
      >
        Sign in
      </Button>

      <p className="text-xs text-ink-subtle">
        Accounts are created on the public site. This screen only signs you in.
      </p>
    </form>
  );
}
