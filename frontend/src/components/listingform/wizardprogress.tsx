"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { postSteps, routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";

const labels: Record<(typeof postSteps)[number], string> = {
  "basic-details": "Basics",
  location: "Location",
  pricing: "Rent",
  amenities: "Amenities",
  photos: "Photos",
  rules: "Rules",
  availability: "Availability",
  preview: "Preview",
};

const lastRequiredStep = "photos";

export function WizardProgress() {
  const pathname = usePathname();
  const currentIndex = postSteps.findIndex(
    (step) => pathname === routes.postStep(step),
  );
  const requiredIndex = postSteps.indexOf(lastRequiredStep);

  return (
    <nav aria-label="Progress" className="border-b border-line bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          {postSteps.map((step, index) => {
            const isDone = currentIndex > index;
            const isCurrent = currentIndex === index;

            return (
              <Link
                key={step}
                href={routes.postStep(step)}
                aria-current={isCurrent ? "step" : undefined}
                className="group flex-1"
                title={labels[step]}
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-colors",
                    isCurrent
                      ? "bg-brand-600"
                      : isDone
                        ? "bg-brand-300"
                        : "bg-surface-sunken group-hover:bg-line-strong",
                  )}
                />

              </Link>

            );
          })}
        </div>

        <p className="mt-2 text-xs text-ink-muted">
          Step {Math.max(1, currentIndex + 1)} of {postSteps.length} ·{" "}
          {labels[postSteps[Math.max(0, currentIndex)] ?? "basic-details"]}
          {currentIndex > requiredIndex && (
            <span className="ml-1 text-ink-subtle">
              — everything from here is optional
            </span>

          )}
        </p>

      </div>

    </nav>

  );
}
