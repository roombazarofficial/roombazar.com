import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/classnames";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Shows a live "n / max" counter. Pair with maxLength. */
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, showCount, className, id, maxLength, value, ...props },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedById = `${textareaId}-description`;
    const length = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? describedById : undefined}
          className={cn(
            "w-full rounded-control border bg-surface px-3 py-2.5",
            "min-h-28 text-sm text-ink outline-none transition-colors",
            "placeholder:text-ink-subtle",
            "focus:border-brand-600 focus:ring-2 focus:ring-brand-100",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-danger" : "border-line-strong",
            className,
          )}
          {...props}
        />

        <div className="mt-1.5 flex items-start justify-between gap-3">
          {hint || error ? (
            <p
              id={describedById}
              className={cn(
                "text-xs",
                error ? "text-danger" : "text-ink-muted",
              )}
            >
              {error ?? hint}
            </p>
          ) : (
            <span />
          )}

          {showCount && maxLength && (
            <span className="shrink-0 text-xs tabular-nums text-ink-subtle">
              {length} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);
