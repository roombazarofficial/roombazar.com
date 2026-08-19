"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/classnames";

/**
 * Bottom sheet on phones, side panel from `md` up.
 *
 * Built on the native <dialog> element rather than a div overlay, which gives
 * us a focus trap, escape-to-close, inert background content, and a real
 * ::backdrop for free. Hand-rolling those is where accessibility bugs live.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Pinned to the bottom, outside the scrolling area. */
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Stops the page behind the sheet scrolling on iOS.
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop closes. The dialog itself is the event target
        // only when the click landed outside its content box.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-[85dvh] w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40",
        "mt-auto sm:mx-auto sm:my-auto sm:max-w-md",
        "open:flex open:flex-col",
      )}
    >
      <div className="flex max-h-[85dvh] flex-col overflow-hidden rounded-t-sheet bg-surface sm:rounded-sheet">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-4 py-3">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-line px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
