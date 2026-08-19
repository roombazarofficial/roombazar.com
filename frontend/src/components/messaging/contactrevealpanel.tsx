"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/classnames";

/**
 * Mutual contact reveal — the mechanism the whole trust model rests on.
 *
 * Three rules, all enforced here and again on the server:
 *   1. Sharing is opt-in per conversation, never account-wide.
 *   2. It is mutual. Revealing yours does not reveal theirs, and you see
 *      nothing until both sides have agreed.
 *   3. It cannot be triggered from a public page — only inside a conversation
 *      that the lister has already replied to.
 *
 * Without all three, a listing page becomes a scrapeable phone directory,
 * which is the exact complaint listers have about the incumbent portals.
 * See docs/03-trust-and-safety.md.
 */
export function ContactRevealPanel({
  youRevealed,
  theyRevealed,
  theirName,
  theirPhone,
  className,
}: {
  youRevealed: boolean;
  theyRevealed: boolean;
  theirName: string;
  /** Only ever sent by the server once both sides have agreed. */
  theirPhone: string | null;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const bothAgreed = youRevealed && theyRevealed;

  if (bothAgreed && theirPhone) {
    return (
      <div
        className={cn(
          "rounded-card border border-success/20 bg-success-soft p-4",
          className,
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-success">
          Contact shared
        </p>
        <a
          href={`tel:+91${theirPhone}`}
          className="mt-1 block text-lg font-semibold text-ink"
        >
          +91 {theirPhone}
        </a>
        <p className="mt-1 text-xs text-ink-muted">
          {theirName} can see your number too.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-card border border-line bg-surface p-4", className)}
    >
      <p className="text-sm font-medium text-ink">Share phone numbers?</p>

      <p className="mt-1 text-sm text-ink-muted">
        {youRevealed
          ? `Waiting for ${theirName} to share theirs. You will both see each other's number once they agree.`
          : `Neither number is visible yet. If you share yours, ${theirName} still has to share theirs before either of you sees anything.`}
      </p>

      {!youRevealed && (
        <Button
          className="mt-3"
          fullWidth
          loading={pending}
          onClick={() => setPending(true)}
        >
          Share my number
        </Button>
      )}

      {youRevealed && (
        <p className="mt-3 rounded-control bg-surface-muted px-3 py-2 text-center text-sm text-ink-muted">
          You have shared your number
        </p>
      )}

      <p className="mt-3 text-xs text-ink-subtle">
        Meet at the room before paying anything. RoomBazar never handles money.
      </p>
    </div>
  );
}
