"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const validPhone = /^[6-9]\d{9}$/.test(digits);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!validPhone) {
      setError("Enter your registered 10-digit Indian mobile number.");
      return;
    }

    setError(null);
    setSubmitting(true);
    router.push(`/reset-password?phone=${encodeURIComponent(digits)}`);
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
        Account Recovery
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Enter your registered phone number. We will send a secure verification code to verify your identity.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          label="Registered Mobile number"
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
          Send recovery code
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs text-ink-muted">
        <span>Remember your access?</span>
        <Link href={routes.login} className="font-medium text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
