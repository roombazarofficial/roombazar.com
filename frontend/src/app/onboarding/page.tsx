"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

/**
 * Asked once, after the first sign-in. Only a name — every other profile
 * field can wait until the user has a reason to fill it in.
 */
export default function Page() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    if (name.trim().length < 2 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile({ name: name.trim() });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not save your name. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        What should we call you?
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        This is shown to people you message and on any rooms you list.
      </p>

      <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <Input
          label="Your name"
          autoComplete="name"
          autoFocus
          placeholder="Priya Raghavan"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <Button size="lg" fullWidth loading={busy} disabled={name.trim().length < 2}>
          Continue
        </Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </main>
  );
}
