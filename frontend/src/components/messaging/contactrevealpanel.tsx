"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/classnames";
import { revealContact } from "@/lib/api/conversations.client";

export function ContactRevealPanel({
  youRevealed,
  theyRevealed,
  theirName,
  theirPhone,
  conversationId,
  className,
}: {
  youRevealed: boolean;
  theyRevealed: boolean;
  theirName: string;
  theirPhone: string | null;
  conversationId: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          onClick={() => {
            setPending(true);
            setError(null);
            void revealContact(conversationId)
              .catch(() => setError("Could not share your number. Try again."))
              .finally(() => setPending(false));
          }}
        >
          Share my number
        </Button>

      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

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
