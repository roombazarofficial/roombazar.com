"use client";

import { useState } from "react";
import { useAuthUi } from "@/store/authuistore";
import { saveListing, unsaveListing } from "@/lib/api/saved.client";
import { cn } from "@/lib/utils/classnames";

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
  const [loading, setLoading] = useState(false);
  const user = useAuthUi((state) => state.user);
  const openSignIn = useAuthUi((state) => state.openSignIn);

  async function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      openSignIn({
        intent: "Sign in to save this room to your wishlist.",
      });
      return;
    }

    if (loading) return;

    const nextSaved = !saved;
    setSaved(nextSaved);
    setLoading(true);

    try {
      if (nextSaved) {
        await saveListing(listingId);
      } else {
        await unsaveListing(listingId);
      }
    } catch (err) {
      setSaved(!nextSaved);
      console.error("Failed to update saved listing", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved wishlist" : "Save this room to wishlist"}
      data-listing-id={listingId}
      onClick={handleToggle}
      className={cn(
        "group relative z-10 flex size-9 items-center justify-center rounded-full",
        "bg-surface/90 backdrop-blur transition-all hover:bg-surface active:scale-90 shadow-2xs hover:shadow-xs cursor-pointer",
        saved ? "text-danger" : "text-ink-muted hover:text-danger",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 transition-transform group-hover:scale-110"
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
