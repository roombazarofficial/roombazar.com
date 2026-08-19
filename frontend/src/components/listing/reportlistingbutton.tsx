"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reportReasons } from "@/lib/constants/reportreasons";
import { cn } from "@/lib/utils/classnames";

/**
 * Reporting is one tap from the listing, with the reasons that actually
 * occur in this market rather than a generic "inappropriate content" box.
 *
 * "Already taken" is first because it is the most common and the most useful:
 * enough of those reports auto-transitions the listing to TAKEN pending the
 * lister confirming. Seekers policing staleness works far better than relying
 * on listers to remember. See docs/03-trust-and-safety.md.
 */
export function ReportListingButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-center text-xs text-ink-subtle underline underline-offset-2 hover:text-ink-muted"
      >
        Report this listing
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={sent ? "Thanks for telling us" : "Report this listing"}
        description={
          sent
            ? "We review scam and harassment reports within four hours, everything else within a day. We will tell you what happened."
            : "What is wrong with it?"
        }
        footer={
          sent ? (
            <Button onClick={() => setOpen(false)}>Close</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!reason} onClick={() => setSent(true)}>
                Send report
              </Button>
            </>
          )
        }
      >
        {!sent && (
          <div className="space-y-3" data-listing-id={listingId}>
            <ul className="space-y-1.5">
              {reportReasons.map((item) => (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => setReason(item.value)}
                    aria-pressed={reason === item.value}
                    className={cn(
                      "w-full rounded-control border px-3 py-2.5 text-left text-sm transition-colors",
                      reason === item.value
                        ? "border-brand-600 bg-brand-50 font-medium text-brand-700"
                        : "border-line-strong text-ink hover:bg-surface-muted",
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            <Textarea
              label="Anything else? (optional)"
              maxLength={500}
              showCount
              placeholder="Tell us what happened."
            />
          </div>
        )}
      </Modal>
    </>
  );
}
