import { cn } from "@/lib/utils/classnames";

/**
 * How recently a listing was posted. Staleness is the metric this whole
 * marketplace is judged on, so freshness is surfaced on every card rather
 * than buried on the detail page.
 */
export function FreshnessLabel({
  publishedAt,
  className,
}: {
  publishedAt: string;
  className?: string;
}) {
  const days = Math.floor(
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  const label =
    days <= 0
      ? "Posted today"
      : days === 1
        ? "Posted yesterday"
        : days < 7
          ? `Posted ${days} days ago`
          : days < 14
            ? "Posted last week"
            : days < 31
              ? `Posted ${Math.floor(days / 7)} weeks ago`
              : "Posted over a month ago";

  return (
    <span
      className={cn(
        "text-xs",
        days >= 21 ? "text-warning" : "text-ink-subtle",
        className,
      )}
    >
      {label}
    </span>
  );
}
