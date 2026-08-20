"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <Button variant="secondary" fullWidth onClick={share} className="mt-2">
      {copied ? "Link copied" : "Share this room"}
    </Button>

  );
}
