import { mockAudit } from "@/lib/api/mockmoderation";

/**
 * Append-only. Every moderator action writes a row, so nothing about a
 * suspension is inferable only from the mutated record — see
 * docs/01-data-model.md.
 */
export default function Page() {
  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Append-only record of every moderator action. Entries cannot be
          edited or removed.
        </p>
      </header>

      <ul className="mt-6 space-y-2">
        {mockAudit.map((row) => (
          <li
            key={row.id}
            className="rounded-card border border-line bg-surface p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-ink">{row.action}</p>
              <time dateTime={row.at} className="text-xs text-ink-subtle">
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(row.at))}
              </time>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {row.moderator} · {row.target}
            </p>
            <p className="mt-1.5 text-sm text-ink-muted">{row.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
