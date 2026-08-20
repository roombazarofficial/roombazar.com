"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirmdialog";

export function BlockUserButton({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);

  if (blocked) {
    return (
      <p className="text-sm text-ink-muted">{name} is blocked</p>

    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left text-sm text-ink-muted hover:text-ink"
      >
        Block {name}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setBlocked(true)}
        title={`Block ${name}?`}
        description="They will not be able to message you again, and they are not told that you blocked them. Your conversation stays available to you."
        confirmLabel="Block"
        destructive
      />

    </>

  );
}
