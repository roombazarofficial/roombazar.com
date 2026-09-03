"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUi } from "@/store/authuistore";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";
import { ApiRequestError } from "@/lib/api/client";
import {
  completeSignup,
  confirmPasswordReset,
  login,
  lookupEmail,
  requestPasswordReset,
  startSignup,
  verifyEmailCode,
} from "@/lib/api/auth";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

/** Mirrors the server rule in backend/src/modules/auth/password.ts. */
const MIN_PASSWORD = 6;

type Step = "email" | "password" | "code" | "details" | "reset";

function messageOf(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    const field = error.body.fields
      ? Object.values(error.body.fields)[0]
      : undefined;

    return field ?? error.body.message;
  }

  return fallback;
}

export function AuthModal() {
  const router = useRouter();
  const { open, intent, nextPath, closeSignIn, setUser } = useAuthUi();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resetting, setResetting] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "code" || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  function reset() {
    setStep("email");
    setEmail("");
    setPassword("");
    setName("");
    setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
    setError(null);
    setBusy(false);
    setResetting(false);
  }

  function close() {
    closeSignIn();
    reset();
  }

  const address = () => email.trim().toLowerCase();

  /**
   * One field decides the route.
   *
   * Asking the API whether the address is registered means nobody has to pick
   * between "sign in" and "sign up" before typing anything: an existing user
   * goes to a password, a new one to a verification code.
   */
  async function submitEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address())) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const { registered } = await lookupEmail(address());

      if (registered) {
        setStep("password");
      } else {
        await startSignup(address());
        setSecondsLeft(RESEND_SECONDS);
        setStep("code");
      }
    } catch (caught) {
      setError(messageOf(caught, "Something went wrong. Try again."));
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword() {
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const { user } = await login({ email: address(), password });
      setUser(user);
      finish();
    } catch (caught) {
      setError(messageOf(caught, "Email or password is incorrect."));
      setBusy(false);
    }
  }

  /** Verifies the OTP with the backend before allowing the user to proceed. */
  async function submitCode() {
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) return;
    setError(null);
    setBusy(true);

    try {
      await verifyEmailCode({
        email: address(),
        code,
        purpose: resetting ? "passwordreset" : "signup",
      });

      setStep(resetting ? "reset" : "details");
    } catch (caught) {
      setError(messageOf(caught, "That code is wrong or has expired."));
    } finally {
      setBusy(false);
    }
  }

  async function submitDetails() {
    setBusy(true);
    setError(null);

    try {
      const { user } = await completeSignup({
        email: address(),
        code: digits.join(""),
        password,
        name: name.trim(),
      });

      setUser(user);
      finish();
    } catch (caught) {
      setError(messageOf(caught, "Could not create your account."));
      setBusy(false);
    }
  }

  async function submitReset() {
    setBusy(true);
    setError(null);

    try {
      await confirmPasswordReset({
        email: address(),
        code: digits.join(""),
        password,
      });

      // Resetting revokes every session, so there is nothing to carry forward:
      // they sign in again with the new password.
      setResetting(false);
      setPassword("");
      setStep("password");
    } catch (caught) {
      setError(messageOf(caught, "Could not reset your password."));
    } finally {
      setBusy(false);
    }
  }

  async function beginReset() {
    setBusy(true);
    setError(null);

    try {
      await requestPasswordReset(address());
      setResetting(true);
      setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
      setPassword("");
      setSecondsLeft(RESEND_SECONDS);
      setStep("code");
    } catch (caught) {
      setError(messageOf(caught, "Could not send a reset code."));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError(null);

    try {
      if (resetting) await requestPasswordReset(address());
      else await startSignup(address());

      setSecondsLeft(RESEND_SECONDS);
    } catch (caught) {
      setError(messageOf(caught, "Could not resend the code."));
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    const target = nextPath;
    close();

    if (target) router.push(target);
    // Server components hold session-dependent data and must re-render against
    // the new session rather than the signed-out one.
    router.refresh();
  }

  function setDigit(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "");
    const next = [...digits];

    if (!cleaned) {
      next[index] = "";
      setDigits(next);
      if (error) setError(null);
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, CODE_LENGTH).split("");
      chars.forEach((char, offset) => {
        if (index + offset < CODE_LENGTH) {
          next[index + offset] = char;
        }
      });
      setDigits(next);
      if (error) setError(null);
      const nextFocus = Math.min(index + chars.length, CODE_LENGTH - 1);
      inputs.current[nextFocus]?.focus();
      return;
    }

    next[index] = cleaned.slice(-1);
    setDigits(next);
    if (error) setError(null);
    if (index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  const codeComplete = digits.join("").length === CODE_LENGTH;

  const titles: Record<Step, string> = {
    email: "Sign in or create an account",
    password: "Welcome back",
    code: resetting ? "Check your email" : "Confirm your email",
    details: "Finish setting up",
    reset: "Choose a new password",
  };

  const descriptions: Record<Step, string> = {
    email:
      intent ??
      "Enter your email and we will take it from there. No password needed to start.",
    password: `Signing in as ${address()}.`,
    code: `We sent a six-digit code to ${address()}.`,
    details: "Choose a password and tell us your name.",
    reset: "Your other devices will be signed out.",
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={titles[step]}
      description={descriptions[step]}
    >
      <div className="space-y-4">
        {step === "email" && (
          <>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              error={error ?? undefined}
              disabled={busy}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submitEmail();
              }}
            />

            <Button
              size="lg"
              fullWidth
              loading={busy}
              onClick={() => void submitEmail()}
            >
              Continue
            </Button>

            <p className="text-xs text-ink-muted">
              Your email is never shown on your listings or profile.
            </p>

            <p className="text-xs text-ink-subtle">
              By continuing you agree to our{" "}
              <Link href={routes.terms} className="underline hover:text-ink-muted">
                terms
              </Link>{" "}
              and{" "}
              <Link href={routes.privacy} className="underline hover:text-ink-muted">
                privacy policy
              </Link>
              .
            </p>
          </>
        )}

        {step === "password" && (
          <>
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              autoFocus
              value={password}
              error={error ?? undefined}
              disabled={busy}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submitPassword();
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex items-center justify-center text-ink-muted hover:text-ink transition-colors p-1 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              }
            />

            <Button
              size="lg"
              fullWidth
              loading={busy}
              onClick={() => void submitPassword()}
            >
              Sign in
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setError(null);
                }}
                className="text-ink-muted hover:text-ink"
              >
                Use a different email
              </button>

              <button
                type="button"
                onClick={() => void beginReset()}
                className="text-brand-700 underline hover:text-brand-800"
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {step === "code" && (
          <>
            <div className="flex gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  autoFocus={index === 0}
                  maxLength={CODE_LENGTH}
                  value={digit}
                  disabled={busy}
                  aria-label={`Digit ${index + 1}`}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onFocus={(event) => event.target.select()}
                  onPaste={(event) => {
                    event.preventDefault();
                    const pasted = event.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, CODE_LENGTH);
                    if (!pasted) return;
                    const next = [...digits];
                    pasted.split("").forEach((char, i) => {
                      next[i] = char;
                    });
                    setDigits(next);
                    if (error) setError(null);
                    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace") {
                      event.preventDefault();
                      const next = [...digits];
                      if (digits[index]) {
                        next[index] = "";
                        setDigits(next);
                        if (error) setError(null);
                      } else if (index > 0) {
                        next[index - 1] = "";
                        setDigits(next);
                        if (error) setError(null);
                        inputs.current[index - 1]?.focus();
                      }
                      return;
                    }
                    if (event.key === "ArrowLeft" && index > 0) {
                      event.preventDefault();
                      inputs.current[index - 1]?.focus();
                      return;
                    }
                    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
                      event.preventDefault();
                      inputs.current[index + 1]?.focus();
                      return;
                    }
                    if (event.key === "Enter" && codeComplete && !busy) {
                      event.preventDefault();
                      void submitCode();
                    }
                  }}
                  className={cn(
                    "h-14 w-full rounded-control border text-center text-xl font-semibold",
                    "border-line-strong bg-surface text-ink outline-none",
                    "focus:border-brand-600 focus:ring-2 focus:ring-brand-100",
                    "disabled:opacity-60",
                  )}
                />
              ))}
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button
              size="lg"
              fullWidth
              disabled={!codeComplete || busy}
              loading={busy}
              onClick={() => void submitCode()}
            >
              Continue
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError(null);
                  setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
                }}
                className="text-ink-muted hover:text-ink"
              >
                Change email
              </button>

              {secondsLeft > 0 ? (
                <span className="text-ink-subtle">Resend in {secondsLeft}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void resend()}
                  className="text-brand-700 underline hover:text-brand-800"
                >
                  Resend code
                </button>
              )}
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <Input
              label="Your name"
              autoComplete="name"
              autoFocus
              placeholder="Enter your full name"
              value={name}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              hint={`At least ${MIN_PASSWORD} characters.`}
              value={password}
              error={error ?? undefined}
              disabled={busy}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submitDetails();
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex items-center justify-center text-ink-muted hover:text-ink transition-colors p-1 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              }
            />

            <Button
              size="lg"
              fullWidth
              loading={busy}
              disabled={name.trim().length < 2 || password.length < MIN_PASSWORD}
              onClick={() => void submitDetails()}
            >
              Create account
            </Button>
          </>
        )}

        {step === "reset" && (
          <>
            <Input
              label="New password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              hint={`At least ${MIN_PASSWORD} characters.`}
              value={password}
              error={error ?? undefined}
              disabled={busy}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submitReset();
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex items-center justify-center text-ink-muted hover:text-ink transition-colors p-1 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              }
            />

            <Button
              size="lg"
              fullWidth
              loading={busy}
              disabled={password.length < MIN_PASSWORD}
              onClick={() => void submitReset()}
            >
              Set new password
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
