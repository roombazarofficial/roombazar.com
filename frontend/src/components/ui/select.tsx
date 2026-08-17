import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/classnames";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  /** Rendered as a disabled first option, e.g. "Any room type". */
  placeholder?: string;
}

/**
 * A native select on purpose. On Android and iOS this opens the platform
 * picker, which is faster and more familiar than any custom dropdown — and it
 * works without JavaScript, which matters on flaky connections.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, hint, error, options, placeholder, className, id, ...props },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedById = `${selectId}-description`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? describedById : undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-control border bg-surface",
            "px-3 pr-9 text-sm text-ink outline-none transition-colors",
            "focus:border-brand-600 focus:ring-2 focus:ring-brand-100",
            "disabled:cursor-not-allowed disabled:opacity-60",
            // Chevron drawn as a background image so no icon import is needed.
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%23667085%27 stroke-width=%271.5%27%3E%3Cpath d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E')]",
            "bg-[length:20px_20px] bg-[position:right_10px_center] bg-no-repeat",
            error ? "border-danger" : "border-line-strong",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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
  },
);
