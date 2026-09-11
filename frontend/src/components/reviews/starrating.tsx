"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/classnames";

/** Read-only stars, sized for inline display next to an average or a card. */
export function StarDisplay({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass = size === "xs" ? "size-3" : size === "md" ? "size-5" : "size-4";

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          filled={star <= Math.round(value)}
          className={sizeClass}
        />
      ))}
    </div>
  );
}

/** Interactive 1-5 picker for the review form. */
export function StarInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div>
      {label && (
        <p className="mb-1 text-xs font-medium text-ink-muted">{label}</p>
      )}
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Star filled={star <= shown} className="size-6" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Star({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className={cn(filled ? "text-amber-400" : "text-line-strong", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.75l2.955 6.09 6.545.84-4.77 4.61 1.19 6.53L12 17.77l-5.92 3.09 1.19-6.53-4.77-4.61 6.545-.84L12 2.75z"
      />
    </svg>
  );
}
