"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"seeker" | "owner">("seeker");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const validPhone = /^[6-9]\d{9}$/.test(digits);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!validPhone) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setError(null);
    setSubmitting(true);
    router.push(`${routes.verify}?phone=${encodeURIComponent(digits)}&name=${encodeURIComponent(name)}&intent=${role}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link href={routes.home} className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
        <img
          src="/logo/rb-logo.png"
          alt="RoomBazar"
          className="h-8 w-8 rounded-full"
        />
        <span>
          Room<span className="text-brand-600">Bazar</span>
        </span>
      </Link>

      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
        Create your RoomBazar account
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Join as a seeker to find rooms or as a property owner to list your space.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="block text-2xs font-semibold uppercase tracking-wide text-ink mb-1.5">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("seeker")}
              className={`rounded-control border p-3 text-center text-sm font-medium transition-colors ${
                role === "seeker"
                  ? "border-brand-600 bg-brand-50 text-brand-700 font-semibold"
                  : "border-line bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              Find a room
            </button>
            <button
              type="button"
              onClick={() => setRole("owner")}
              className={`rounded-control border p-3 text-center text-sm font-medium transition-colors ${
                role === "owner"
                  ? "border-brand-600 bg-brand-50 text-brand-700 font-semibold"
                  : "border-line bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              List my room
            </button>
          </div>
        </div>

        <Input
          label="Your full name"
          type="text"
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
        />

        <Input
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          prefix="+91"
          placeholder="98765 43210"
          maxLength={11}
          value={phone}
          error={error ?? undefined}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError(null);
          }}
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Continue with OTP verification
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs text-ink-muted">
        <span>Already have an account?</span>
        <Link href={routes.login} className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </div>

      <p className="mt-8 border-t border-line pt-4 text-xs text-ink-subtle">
        By registering you agree to our{" "}
        <Link href={routes.terms} className="underline hover:text-ink-muted">terms</Link>{" "}
        and{" "}
        <Link href={routes.privacy} className="underline hover:text-ink-muted">privacy policy</Link>.
      </p>
    </main>
  );
}
