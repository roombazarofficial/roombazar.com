"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/classnames";

/**
 * Sits on top of the listing card, above the stretched link that makes the
 * whole card clickable. It needs its own stacking context and a stopped
 * propagation, or tapping save navigates to the listing instead.
 */
export function SaveListingButton({
  listingId,
  initialSaved = false,
  className,
}: {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save this room"}
      data-listing-id={listingId}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setSaved((value) => !value);
      }}
      className={cn(
        "relative z-10 flex size-9 items-center justify-center rounded-full",
        "bg-surface/90 backdrop-blur transition-colors hover:bg-surface",
        saved ? "text-danger" : "text-ink-muted",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.7-7.8 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
