import { cn } from "@/lib/utils/classnames";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
type Size = "sm" | "md";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-muted",
  brand: "bg-brand-100 text-brand-700 font-medium",
  success: "bg-success-soft text-success font-medium",
  warning: "bg-warning-soft text-warning font-medium",
  danger: "bg-danger-soft text-danger font-medium",
  info: "bg-info-soft text-info font-medium",
};

const sizes: Record<Size, string> = {
  sm: "px-2 py-0.5 text-2xs",
  md: "px-2.5 py-1 text-2xs",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  /** Adds a small dot before the label — useful for listing status. */
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full whitespace-nowrap",
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
