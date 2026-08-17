"use client";

import { useRef } from "react";
import { StepShell } from "@/components/listingform/stepshell";
import { Button } from "@/components/ui/button";
import { useListingDraft } from "@/store/listingdraftstore";
import { cn } from "@/lib/utils/classnames";

/**
 * Photos are the one required field seekers will not forgive being missing —
 * a listing without them is ignored and drags down every results page it
 * appears on.
 *
 * Uploads will go straight from the browser to R2 via a presigned URL rather
 * than through the app server; see docs/02-architecture.md. This step holds
 * the interface for that.
 */
export default function Page() {
  const { draft, update } = useListingDraft();
  const inputRef = useRef<HTMLInputElement>(null);

  function addPlaceholders(count: number) {
    const next = Array.from(
      { length: count },
      (_, index) => `pending-${draft.photoIds.length + index + 1}`,
    );
    update({ photoIds: [...draft.photoIds, ...next] });
  }

  function remove(id: string) {
    update({ photoIds: draft.photoIds.filter((item) => item !== id) });
  }

  return (
    <StepShell
      step="photos"
      title="Add photos"
      description="At least one is required. Rooms with three or more photos get far more enquiries."
      canContinue={draft.photoIds.length > 0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          const count = event.target.files?.length ?? 0;
          if (count > 0) addPlaceholders(count);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-card",
          "border-2 border-dashed border-line-strong bg-surface-muted px-6 py-12",
          "text-center transition-colors hover:border-brand-400 hover:bg-brand-50",
        )}
      >
        <span className="text-sm font-medium text-ink">
          Tap to add photos
        </span>
        <span className="text-xs text-ink-muted">
          JPG, PNG or WebP. Up to 10 photos.
        </span>
      </button>

      {draft.photoIds.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-ink-muted">
            {draft.photoIds.length} photo
            {draft.photoIds.length === 1 ? "" : "s"} · the first one is your
            cover
          </p>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {draft.photoIds.map((id, index) => (
              <div
                key={id}
                className="relative aspect-4/3 overflow-hidden rounded-control bg-surface-sunken"
              >
                <div className="flex size-full items-center justify-center text-xs text-ink-subtle">
                  Uploading…
                </div>

                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-2xs font-medium text-ink-inverse">
                    Cover
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-ink/70 text-ink-inverse hover:bg-ink"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*
        Stated plainly because listers are surprised by it otherwise, and
        because it is a privacy protection rather than a limitation.
      */}
      <aside className="rounded-card border border-line bg-surface-muted p-4">
        <p className="text-sm text-ink-muted">
          Location data is stripped from every photo before it is published, so
          your address cannot be read out of the image file.
        </p>
      </aside>

      {draft.photoIds.length === 0 && (
        <Button
          variant="ghost"
          fullWidth
          onClick={() => addPlaceholders(3)}
          className="text-ink-subtle"
        >
          Simulate three uploads (development only)
        </Button>
      )}
    </StepShell>
  );
}
