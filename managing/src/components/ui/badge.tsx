import { cn } from "@/lib/utils/classnames";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-muted",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

type Size = "sm" | "md";

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1 text-2xs",
  md: "px-3 py-1.5 text-xs",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        "font-medium whitespace-nowrap",
        sizes[size],
        tones[tone],
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
