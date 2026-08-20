import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/classnames";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, prefix, suffix, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedById = `${inputId}-description`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {label}
        </label>

      )}

      <div
        className={cn(
          "flex items-center gap-2 rounded-control border bg-surface px-3",
          "h-11 transition-colors",
          "focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100",
          error ? "border-danger" : "border-line-strong",
        )}
      >
        {prefix && (
          <span className="shrink-0 text-sm text-ink-muted">{prefix}</span>

        )}

        <input
          ref={ref}
          id={inputId}
          data-input-control
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? describedById : undefined}
          className={cn(
            "w-full bg-transparent text-sm text-ink outline-none",
            "placeholder:text-ink-subtle",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          {...props}
        />

        {suffix && (
          <span className="shrink-0 text-sm text-ink-muted">{suffix}</span>

        )}
      </div>

      {(hint || error) && (
        <p
          id={describedById}
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-danger" : "text-ink-muted",
          )}
        >
          {error ?? hint}
        </p>

      )}
    </div>

  );
});
