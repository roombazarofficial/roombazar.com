"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { requestPasswordReset } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!validEmail) {
      setError("Enter your registered email address.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send the recovery code.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link href={routes.home} className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
        <Image
          src="/logo/rb-logo.png"
          alt="RoomBazar"
          width={32}
          height={32}
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
        Enter your registered email address. We will send a secure verification code to verify your identity.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          label="Registered email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={error ?? undefined}
          onChange={(e) => {
            setEmail(e.target.value);
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
