"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarInput } from "./starrating";
import { submitReview } from "@/lib/api/reviews.client";
import type { PropertyReview, SubmitReviewInput } from "@/types/review";

const ASPECTS: { key: keyof Omit<SubmitReviewInput, "overallRating" | "body" | "photos">; label: string }[] = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "locationScore", label: "Location" },
  { key: "valueForMoney", label: "Value for money" },
  { key: "accuracy", label: "Property accuracy" },
  { key: "hostBehavior", label: "Owner/host behaviour" },
];

export function ReviewForm({
  open,
  onClose,
  listingId,
  listingTitle,
  existing,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  existing?: PropertyReview | null;
  onSubmitted: () => void;
}) {
  const [overall, setOverall] = useState(existing?.overallRating ?? 0);
  const [aspects, setAspects] = useState<Record<string, number>>({
    cleanliness: existing?.cleanliness ?? 0,
    locationScore: existing?.locationScore ?? 0,
    valueForMoney: existing?.valueForMoney ?? 0,
    accuracy: existing?.accuracy ?? 0,
    hostBehavior: existing?.hostBehavior ?? 0,
  });
  const [body, setBody] = useState(existing?.body ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!overall || !body.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await submitReview(listingId, {
        overallRating: overall,
        cleanliness: aspects.cleanliness || null,
        locationScore: aspects.locationScore || null,
        valueForMoney: aspects.valueForMoney || null,
        accuracy: aspects.accuracy || null,
        hostBehavior: aspects.hostBehavior || null,
        body: body.trim(),
      });
      setDone(true);
      onSubmitted();
    } catch {
      setError("Could not submit your review. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) {
          onClose();
          setDone(false);
        }
      }}
      title={done ? "Thanks for sharing!" : existing ? "Update your review" : "Write a review"}
      description={
        done
          ? "Your review helps other seekers make a confident decision."
          : `What did you like or dislike about "${listingTitle}"?`
      }
      footer={
        done ? (
          <Button
            onClick={() => {
              onClose();
              setDone(false);
            }}
          >
            Close
          </Button>
        ) : (
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="secondary" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button
              loading={busy}
              disabled={!overall || !body.trim() || busy}
              onClick={() => void handleSubmit()}
            >
              {existing ? "Update review" : "Submit review"}
            </Button>
          </div>
        )
      }
    >
      {!done ? (
        <div className="space-y-4">
          <StarInput value={overall} onChange={setOverall} label="Overall rating" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ASPECTS.map(({ key, label }) => (
              <StarInput
                key={key}
                label={label}
                value={aspects[key] ?? 0}
                onChange={(v) => setAspects((prev) => ({ ...prev, [key]: v }))}
              />
            ))}
          </div>

          <Textarea
            label="Your review"
            rows={4}
            maxLength={2000}
            showCount
            required
            value={body}
            error={error ?? undefined}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            placeholder="What did you like or dislike about this property?"
          />
        </div>
      ) : (
        <div className="py-2 text-center" role="status" aria-live="polite">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success text-2xl">
            ✓
          </div>
          <p className="mt-3 text-sm font-medium text-ink">You&apos;re all set!</p>
        </div>
      )}
    </Modal>
  );
}
