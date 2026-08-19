"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (code.length < 6) {
      setError("Please enter the complete 6-digit recovery code.");
      return;
    }
    if (password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        router.push(routes.login);
      }, 2000);
    }, 800);
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
        Reset Account Password
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {phone ? `Enter the 6-digit code sent to +91 ${phone}` : "Enter your recovery code and choose a new password."}
      </p>

      {success ? (
        <div className="mt-8 rounded-card border border-success/30 bg-success-soft p-5 text-center">
          <p className="text-sm font-semibold text-success">Password updated successfully!</p>
          <p className="mt-1 text-xs text-ink-muted">Redirecting you to sign in...</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Input
            label="6-Digit Recovery Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              if (error) setError(null);
            }}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            error={error ?? undefined}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
          />

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Update Password & Sign In
          </Button>
        </form>
      )}

      <div className="mt-6 flex items-center justify-between text-xs text-ink-muted">
        <span>Back to login?</span>
        <Link href={routes.login} className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </div>
    </main>
  );
}
