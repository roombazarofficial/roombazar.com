import { cn } from "@/lib/utils/classnames";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: Size;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full",
        "border-brand-600 border-t-transparent",
        sizes[size],
        className,
      )}
    />

  );
}
