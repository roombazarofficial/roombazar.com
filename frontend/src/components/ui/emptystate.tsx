import { cn } from "@/lib/utils/classnames";

/**
 * Shown when a list has nothing in it. Every empty state should offer a way
 * out — an empty search with no suggested action is a dead end, and this
 * marketplace will have plenty of thin localities early on.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card",
        "border border-dashed border-line-strong bg-surface-muted",
        "px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="mb-3 text-ink-subtle">{icon}</div>}

      <h3 className="text-base font-semibold text-ink">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
