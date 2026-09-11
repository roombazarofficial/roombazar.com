"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/classnames";
import { submitPlatformFeedback } from "@/lib/api/reviews.client";
import type { FeedbackCategory, FeedbackSentiment } from "@/types/review";

const SENTIMENTS: { value: FeedbackSentiment; emoji: string; label: string }[] = [
  { value: "loved", emoji: "😀", label: "Loved it" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "couldbebetter", emoji: "🙁", label: "Could be better" },
  { value: "notsatisfied", emoji: "😞", label: "Not satisfied" },
];

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "search", label: "Search" },
  { value: "listings", label: "Listings" },
  { value: "propertyinfo", label: "Property information" },
  { value: "contactingowner", label: "Contacting owner" },
  { value: "bookinginquiry", label: "Booking/inquiry" },
  { value: "websiteexperience", label: "Website experience" },
  { value: "other", label: "Other" },
];

/**
 * A separate channel from PropertyReview: this is feedback about RoomBazar
 * itself, not about any one listing. Trigger lives in the footer — always
 * reachable, never in the way.
 */
export function PlatformFeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [sentiment, setSentiment] = useState<FeedbackSentiment | null>(null);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function reset() {
    setSentiment(null);
    setCategory(null);
    setMessage("");
    setSent(false);
  }

  async function submit() {
    if (!sentiment || busy) return;
    setBusy(true);
    try {
      await submitPlatformFeedback({
        sentiment,
        category,
        message: message.trim() || null,
      });
      setSent(true);
    } catch {
      // Best-effort — feedback isn't critical-path, fail quietly with a note.
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-brand-600"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Share feedback about RoomBazar
      </button>

      <Modal
        open={open}
        onClose={() => {
          if (!busy) {
            setOpen(false);
            reset();
          }
        }}
        title={sent ? "Thank you!" : "How was your RoomBazar experience?"}
        description={
          sent
            ? "Your feedback helps us make RoomBazar better."
            : "This is about the website itself, not a specific property."
        }
        footer={
          sent ? (
            <Button
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Close
            </Button>
          ) : (
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={busy} disabled={!sentiment} onClick={() => void submit()}>
                Share feedback
              </Button>
            </div>
          )
        }
      >
        {!sent ? (
          <div className="space-y-4">
            <div className="flex justify-between gap-1 sm:gap-2">
              {SENTIMENTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSentiment(item.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl border px-1 py-2.5 transition-colors",
                    sentiment === item.value
                      ? "border-brand-600 bg-brand-50"
                      : "border-line hover:bg-surface-muted",
                  )}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-medium leading-tight text-ink-muted text-center">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-ink-muted">
                What should we improve? (optional)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setCategory((prev) => (prev === item.value ? null : item.value))
                    }
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      category === item.value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-line text-ink-muted hover:bg-surface-muted",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Anything else? (optional)"
              rows={3}
              maxLength={1000}
              showCount
              placeholder="Tell us more..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        ) : (
          <div className="py-2 text-center" role="status" aria-live="polite">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success text-2xl">
              ✓
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
