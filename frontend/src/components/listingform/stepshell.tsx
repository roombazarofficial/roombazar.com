"use client";

import Link from "next/link";
import { Button, buttonStyles } from "@/components/ui/button";
import type { PostStep } from "@/lib/constants/routes";
import { postSteps, routes } from "@/lib/constants/routes";

/**
 * Shared frame for every wizard step: heading, the step's fields, and the
 * navigation. Keeping this in one place means the back/next behaviour cannot
 * drift between steps.
 */
export function StepShell({
  step,
  title,
  description,
  children,
  canContinue = true,
}: {
  step: PostStep;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Blocks "Continue" while a required field on this step is empty. */
  canContinue?: boolean;
}) {
  const index = postSteps.indexOf(step);
  const previous = index > 0 ? postSteps[index - 1] : null;
  const next = index < postSteps.length - 1 ? postSteps[index + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-ink-muted">{description}</p>
        )}
      </header>

      <div className="space-y-6">{children}</div>

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
        {previous ? (
          <Link
            href={routes.postStep(previous)}
            className={buttonStyles({ variant: "ghost" })}
          >
            Back
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link
            href={canContinue ? routes.postStep(next) : "#"}
            aria-disabled={!canContinue}
            className={buttonStyles({
              className: canContinue
                ? undefined
                : "pointer-events-none opacity-50",
            })}
          >
            Continue
          </Link>
        )}

        {!next && <Button size="lg">Publish listing</Button>}
      </div>
    </div>
  );
}
