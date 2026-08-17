import Link from "next/link";
import { cn } from "@/lib/utils/classnames";

/**
 * Page links are real anchors, not buttons, so results stay crawlable and
 * middle-clickable. Deep pages are mostly crawlers anyway, which is why the
 * window stays narrow rather than rendering fifty numbers.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const window = 2;
  const pages: number[] = [];

  for (let n = 1; n <= totalPages; n += 1) {
    const nearCurrent = Math.abs(n - page) <= window;
    if (n === 1 || n === totalPages || nearCurrent) pages.push(n);
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          rel="prev"
          className="rounded-control border border-line-strong px-3 py-2 text-sm text-ink hover:bg-surface-muted"
        >
          Previous
        </Link>
      )}

      {pages.map((n, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && n - previous > 1;

        return (
          <span key={n} className="flex items-center gap-1">
            {gap && <span className="px-1 text-ink-subtle">…</span>}
            <Link
              href={buildHref(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "min-w-10 rounded-control px-3 py-2 text-center text-sm",
                n === page
                  ? "bg-brand-600 font-medium text-ink-inverse"
                  : "border border-line-strong text-ink hover:bg-surface-muted",
              )}
            >
              {n}
            </Link>
          </span>
        );
      })}

      {page < totalPages && (
        <Link
          href={buildHref(page + 1)}
          rel="next"
          className="rounded-control border border-line-strong px-3 py-2 text-sm text-ink hover:bg-surface-muted"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
