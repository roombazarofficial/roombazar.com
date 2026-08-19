"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/classnames";

/**
 * Centred dialog. Same native <dialog> foundation as the drawer — focus
 * trap, escape handling and inert background come from the platform.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md bg-transparent p-0",
        "backdrop:bg-ink/40",
      )}
    >
      <div className="rounded-sheet bg-surface p-5 shadow-overlay">
        <h2 className="text-base font-semibold text-ink">{title}</h2>

        {description && (
          <p className="mt-1.5 text-sm text-ink-muted">{description}</p>
        )}

        {children && <div className="mt-4">{children}</div>}

        {footer && (
          <div className="mt-5 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </dialog>
  );
}
