import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/classnames";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  /** Right-aligned count, e.g. the number of listings matching a filter. */
  count?: number;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, count, className, id, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          // Full-row target: filter lists are tapped on a phone, and a 16px
          // box is not a realistic target.
          "flex cursor-pointer items-center gap-3 rounded-control px-2 py-2.5",
          "hover:bg-surface-muted has-disabled:cursor-not-allowed has-disabled:opacity-60",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "size-[18px] shrink-0 rounded border-line-strong text-brand-600",
            "accent-brand-600",
          )}
          {...props}
        />

        <span className="flex-1 text-sm text-ink">{label}</span>

        {count !== undefined && (
          <span className="text-xs tabular-nums text-ink-subtle">{count}</span>
        )}
      </label>
    );
  },
);
