import { cn } from "@/lib/utils/classnames";

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
        "flex flex-col items-center justify-center rounded-2xl",
        "border border-dashed border-line-strong bg-surface-muted/60",
        "px-8 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          {icon}
        </div>
      ) : (
        /* Default icon */
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-sunken text-ink-subtle">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="size-7"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      )}

      <h3 className="text-base font-bold text-ink">{title}</h3>

      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
