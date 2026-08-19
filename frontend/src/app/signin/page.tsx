"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/constants/routes";

export default function SignInPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"phone" | "email">("phone");

  // Phone Form State
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Email Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Handle Phone Submit
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    const valid = /^[6-9]\d{9}$/.test(digits);

    if (!valid) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setPhoneError(null);
    setPhoneLoading(true);

    setTimeout(() => {
      router.push(`${routes.verify}?phone=${encodeURIComponent(digits)}`);
    }, 600);
  };

  // Handle Email Submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setEmailError("Password must be at least 6 characters.");
      return;
    }

    setEmailError(null);
    setEmailLoading(true);

    setTimeout(() => {
      router.push(routes.dashboard);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F7] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-line bg-white py-4 px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href={routes.home}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink"
          >
            <Image
              src="/logo/rb-logo.png"
              alt="RoomBazar Logo"
              width={32}
              height={32}
              className="size-8 rounded-full object-contain"
              priority
            />
            <span className="font-bold text-ink text-lg">
              Room<span className="text-brand-600">Bazar</span>
            </span>
          </Link>

          <Link
            href={routes.home}
            className="text-xs sm:text-sm font-medium text-ink-muted transition-colors hover:text-brand-600 flex items-center gap-1"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Sign In Form */}
      <main className="mx-auto my-auto w-full max-w-md px-4 py-10">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Sign in to contact room owners and manage listings
            </p>
          </div>

          {/* Auth Method Tabs */}
          <div className="mt-6 flex rounded-xl bg-surface-muted p-1 border border-line">
            <button
              type="button"
              onClick={() => {
                setMethod("phone");
                setPhoneError(null);
                setEmailError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                method === "phone"
                  ? "bg-white text-brand-600 shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Phone (OTP)
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setPhoneError(null);
                setEmailError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                method === "email"
                  ? "bg-white text-brand-600 shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Email & Password
            </button>
          </div>

          {/* Phone (OTP) Login Form */}
          {method === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="signin-phone"
                  className="block text-xs font-bold uppercase tracking-wider text-ink"
                >
                  Mobile Number
                </label>
                <div className="mt-1.5 flex rounded-xl border border-line bg-white shadow-xs focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
                  <span className="inline-flex items-center px-3.5 text-sm font-semibold text-ink-muted border-r border-line bg-surface-muted rounded-l-xl">
                    +91
                  </span>
                  <input
                    id="signin-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="98765 43210"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    className="w-full rounded-r-xl px-3.5 py-2.5 text-sm font-medium text-ink outline-none"
                    autoFocus
                  />
                </div>
                {phoneError && (
                  <p className="mt-1.5 text-xs text-brand-600 font-medium">
                    {phoneError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={phoneLoading}
                className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-[0.99] disabled:opacity-70"
              >
                {phoneLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="size-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  "Continue with OTP"
                )}
              </button>
            </form>
          ) : (
            /* Email Login Form */
            <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-bold uppercase tracking-wider text-ink"
                >
                  Email Address
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none shadow-xs focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signin-password"
                    className="block text-xs font-bold uppercase tracking-wider text-ink"
                  >
                    Password
                  </label>
                  <Link
                    href={routes.forgotPassword}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none shadow-xs focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {emailError && (
                <p className="text-xs text-brand-600 font-medium">
                  {emailError}
                </p>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-[0.99] disabled:opacity-70"
              >
                {emailLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="size-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-2xs uppercase">
              <span className="bg-white px-3 text-ink-subtle font-bold tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={() => {
              router.push(routes.dashboard);
            }}
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-xs transition-all hover:bg-surface-muted active:scale-[0.99]"
          >
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Create Account Link */}
          <div className="mt-6 border-t border-line pt-4 text-center">
            <p className="text-xs text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link
                href={routes.register}
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Create account free
              </Link>
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="mt-6 text-center text-xs text-ink-subtle">
          By signing in, you agree to RoomBazar&apos;s{" "}
          <Link href={routes.terms} className="underline hover:text-ink-muted">
            Terms
          </Link>{" "}
          and{" "}
          <Link href={routes.privacy} className="underline hover:text-ink-muted">
            Privacy Policy
          </Link>
          .
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-white py-4 px-6 text-center text-xs text-ink-subtle">
        © 2026 RoomBazar · Secure & Verified Rental Platform
      </footer>
    </div>
  );
}
