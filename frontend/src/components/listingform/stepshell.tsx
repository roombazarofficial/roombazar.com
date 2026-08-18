"use client";

import Link from "next/link";
import { Button, buttonStyles } from "@/components/ui/button";
import type { PostStep } from "@/lib/constants/routes";
import { postSteps, routes } from "@/lib/constants/routes";
import { useListingDraft } from "@/store/listingdraftstore";
import { useListingDraftSync } from "@/hooks/uselistingdraftsync";

export function StepShell({
  step,
  title,
  description,
  children,
  canContinue = true,
  action,
}: {
  step: PostStep;
  title: string;
  description?: string;
  children: React.ReactNode;
  canContinue?: boolean;
  /** Replaces the default button on the final step. */
  action?: React.ReactNode;
}) {
  const hydrated = useListingDraft((state) => state.hydrated);

  /*
    Loads the draft from the API and saves changes back. Doing it in an effect
    rather than at module load means the server render and the first client
    render agree, and the stored values arrive in a later render instead of
    contradicting the markup React is hydrating.
  */
  const saveState = useListingDraftSync();

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

        {hydrated && saveState !== "idle" && (
          <p
            role="status"
            className={
              saveState === "error"
                ? "mt-2 text-xs text-danger"
                : "mt-2 text-xs text-ink-subtle"
            }
          >
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "Saved to your account"}
            {saveState === "error" &&
              "Could not save your draft. Your changes are still on screen."}
          </p>
        )}
      </header>

      {hydrated ? (
        <div className="space-y-6">{children}</div>
      ) : (
        <div className="space-y-4" aria-busy>
          <div className="h-11 animate-pulse rounded-control bg-surface-sunken" />
          <div className="h-11 animate-pulse rounded-control bg-surface-sunken" />
          <div className="h-24 animate-pulse rounded-card bg-surface-sunken" />

          <span className="sr-only" role="status">
            Loading your saved draft
          </span>
        </div>
      )}

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
            href={canContinue && hydrated ? routes.postStep(next) : "#"}
            aria-disabled={!canContinue || !hydrated}
            className={buttonStyles({
              className:
                canContinue && hydrated
                  ? undefined
                  : "pointer-events-none opacity-50",
            })}
          >
            Continue
          </Link>
        )}

        {!next &&
          (action ?? (
            <Button size="lg" disabled>
              Publish listing
            </Button>
          ))}
      </div>
    </div>
  );
}
