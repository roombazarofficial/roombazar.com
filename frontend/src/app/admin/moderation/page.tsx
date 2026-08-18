import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/emptystate";
import { getModerationQueue } from "@/lib/api/moderation";

export default async function Page() {
  const queue = await getModerationQueue();

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Moderation queue
        </h1>

        <p className="mt-1 text-sm text-ink-muted">
          {queue.length} items awaiting review, oldest first.
        </p>

      </header>

      {queue.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Queue is clear"
          description="Reported listings and flagged accounts appear here."
        />

      ) : (
        <ul className="mt-6 space-y-3">
          {queue.map((item) => (
            <li
              key={item.id}
              className="rounded-card border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/moderation/${item.id}`}
                    className="text-sm font-medium text-ink hover:underline"
                  >
                    {item.targetType} {item.targetId}
                  </Link>

                  <p className="mt-0.5 text-xs text-ink-muted">
                    Reported for: {item.reason}
                  </p>

                </div>

                <Badge tone="warning">{item.status}</Badge>

              </div>

              {item.detail && (
                <p className="mt-3 rounded-control bg-surface-muted px-3 py-2 text-sm text-ink-muted">
                  {item.detail}
                </p>

              )}
            </li>

          ))}
        </ul>

      )}
    </div>

  );
}
