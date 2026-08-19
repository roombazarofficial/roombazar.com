"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

function VerifyForm() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join("");
  const complete = code.length === CODE_LENGTH;

  function setDigit(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) return;

    const next = [...digits];

    // Handles paste of a whole code into any box, which is what people
    // actually do when the SMS autofill does not fire.
    if (cleaned.length > 1) {
      cleaned
        .slice(0, CODE_LENGTH - index)
        .split("")
        .forEach((char, offset) => {
          next[index + offset] = char;
        });
      setDigits(next);
      inputs.current[Math.min(index + cleaned.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    next[index] = cleaned;
    setDigits(next);
    if (index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link href={routes.home} className="text-lg font-semibold tracking-tight text-ink">
        Room<span className="text-brand-600">Bazar</span>
      </Link>

      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
        Enter the code
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Sent to +91 {phone || "your number"}.{" "}
        <Link href={routes.login} className="text-brand-700 underline hover:text-brand-800">
          Change
        </Link>
      </p>

      <div className="mt-8 flex gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            // Lets the browser and Android fill the code straight from the SMS.
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={index === 0}
            maxLength={CODE_LENGTH}
            value={digit}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            aria-label={`Digit ${index + 1}`}
            className={cn(
              "h-14 w-full rounded-control border text-center text-xl font-semibold",
              "border-line-strong bg-surface text-ink outline-none",
              "focus:border-brand-600 focus:ring-2 focus:ring-brand-100",
            )}
          />
        ))}
      </div>

      <Button size="lg" fullWidth className="mt-6" disabled={!complete}>
        Verify
      </Button>

      <p className="mt-5 text-center text-sm text-ink-muted">
        {secondsLeft > 0 ? (
          <>Resend code in {secondsLeft}s</>
        ) : (
          <button
            type="button"
            onClick={() => setSecondsLeft(RESEND_SECONDS)}
            className="text-brand-700 underline hover:text-brand-800"
          >
            Resend code
          </button>
        )}
      </p>
    </main>
  );
}

export default function Page() {
  // useSearchParams needs a Suspense boundary or the whole route opts out of
  // static rendering.
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
