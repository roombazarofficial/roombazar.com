import { forwardRef } from "react";
import { cn } from "@/lib/utils/classnames";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-ink-inverse hover:bg-brand-700 active:bg-brand-800 shadow-card",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-muted active:bg-surface-sunken",
  ghost: "bg-transparent text-ink hover:bg-surface-muted active:bg-surface-sunken",
  danger: "bg-danger text-ink-inverse hover:brightness-110 active:brightness-95",
  link: "bg-transparent text-brand-700 underline underline-offset-4 hover:text-brand-800",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-control font-medium",
    "transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonStyles({ variant, size, fullWidth, className })}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />

        )}
        {children}
      </button>

    );
  },
);
