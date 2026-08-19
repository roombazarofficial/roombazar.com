"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Sharing is how rooms actually travel in this market — a link forwarded to a
 * family WhatsApp group does more than any amount of on-site browsing.
 *
 * Uses the Web Share API where it exists, which on Android opens the real
 * system sheet with WhatsApp at the top. Everywhere else it falls back to
 * copying the link, which is what people would otherwise do by hand.
 */
export function ShareListingButton({
  slug,
  title,
  rent,
}: {
  slug: string;
  title: string;
  rent: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/room/${slug}`;
    const text = `${title} — ${rent}/month on RoomBazar`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // The user dismissed the sheet. Not an error, and not worth a message.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, or permission denied).
      window.prompt("Copy this link", url);
    }
  }

  return (
    <Button variant="secondary" fullWidth onClick={share} className="mt-2">
      {copied ? "Link copied" : "Share this room"}
    </Button>
  );
}
