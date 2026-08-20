import { EmptyState } from "@/components/ui/emptystate";
import { getAuditLog } from "@/lib/api/moderation";

export default async function Page() {
  const entries = await getAuditLog();

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

      {entries.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No actions recorded yet"
          description="Every approval, suspension and restriction will appear here."
        />

      ) : (
        <ul className="mt-6 space-y-2">
          {entries.map((row) => (
            <li
              key={row.id}
              className="rounded-card border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink">{row.action}</p>

                <time dateTime={row.createdAt} className="text-xs text-ink-subtle">
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(row.createdAt))}
                </time>

              </div>

              <p className="mt-1 text-xs text-ink-muted">
                {row.moderatorId} {"\u00b7"} {row.targetType} {row.targetId}
              </p>

              <p className="mt-1.5 text-sm text-ink-muted">{row.note}</p>

            </li>

          ))}
        </ul>

      )}
    </div>

  );
}
