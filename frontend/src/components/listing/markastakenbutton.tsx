"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirmdialog";

export function MarkAsTakenButton({
  listingId,
  size = "md",
}: {
  listingId: string;
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const [taken, setTaken] = useState(false);

  if (taken) {
    return (
      <span className="inline-flex items-center rounded-control bg-success-soft px-3 py-2 text-sm font-medium text-success">
        Marked as taken
      </span>

    );
  }

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)} data-listing-id={listingId}>
        Mark as taken
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setTaken(true)}
        title="Mark this room as taken?"
        description="It will stop appearing in search straight away and seekers will no longer be able to message you about it. You can reopen it later if the tenant falls through."
        confirmLabel="Mark as taken"
      />

    </>

  );
}
