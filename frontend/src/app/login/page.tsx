"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

/**
 * Phone plus OTP is the only way in. There is no password, so there is no
 * password to forget, reset, reuse, or phish — see docs/02-architecture.md.
 */
export default function Page() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const valid = /^[6-9]\d{9}$/.test(digits);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!valid) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setError(null);
    setSending(true);
    router.push(`${routes.verify}?phone=${encodeURIComponent(digits)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link href={routes.home} className="text-lg font-semibold tracking-tight text-ink">
        Room<span className="text-brand-600">Bazar</span>
      </Link>

      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
        Sign in or create an account
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        We will send a six-digit code to your phone. No password needed.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          autoFocus
          prefix="+91"
          placeholder="98765 43210"
          maxLength={11}
          value={phone}
          error={error ?? undefined}
          onChange={(event) => {
            setPhone(event.target.value);
            if (error) setError(null);
          }}
        />

        <Button type="submit" size="lg" fullWidth loading={sending}>
          Send code
        </Button>
      </form>

      <p className="mt-6 text-xs text-ink-muted">
        Your number is never shown on your listings or profile. It is shared
        with another user only when you both choose to share it.
      </p>

      <p className="mt-4 text-xs text-ink-subtle">
        By continuing you agree to our{" "}
        <Link href={routes.terms} className="underline hover:text-ink-muted">terms</Link>{" "}
        and{" "}
        <Link href={routes.privacy} className="underline hover:text-ink-muted">privacy policy</Link>.
      </p>
    </main>
  );
}
