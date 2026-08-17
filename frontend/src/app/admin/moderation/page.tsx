import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mockQueue } from "@/lib/api/mockmoderation";
import { formatRupees } from "@/lib/format/rupees";

/**
 * The moderation queue.
 *
 * Listings publish immediately and are reviewed in parallel — holding them
 * for approval kills supply, and the harm window for a bad listing is the
 * hours before a seeker contacts it, which post-publication review covers.
 *
 * Ordering is fixed rather than sortable: reported-by-multiple-users, then
 * scam signals, then new users, then a random sample for calibration. A
 * moderator working top-down should always be working the highest-harm item.
 * See docs/03-trust-and-safety.md.
 */
export default function Page() {
  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Moderation queue
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {mockQueue.length} listings awaiting review, highest harm first
        </p>
      </header>

      <ul className="mt-6 space-y-3">
        {mockQueue.map((item) => (
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
                  {item.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {formatRupees(item.rentPaise)}/month · {item.localityName} ·
                  posted by {item.listerName} ({item.listerAge})
                </p>
              </div>

              <Badge tone={priorityTone(item.priority)}>
                {priorityLabel(item.priority)}
              </Badge>
            </div>

            {/* Each flag names the specific signal, not just "suspicious" —
                a moderator deciding in seconds needs the reason, not a score. */}
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {item.flags.map((flag) => (
                <li
                  key={flag}
                  className="rounded-full bg-danger-soft px-2.5 py-1 text-2xs font-medium text-danger"
                >
                  {flag}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/admin/moderation/${item.id}`}
                className="rounded-control bg-brand-600 px-3 py-2 text-sm font-medium text-ink-inverse hover:bg-brand-700"
              >
                Review
              </Link>
              <button className="rounded-control border border-line-strong px-3 py-2 text-sm text-ink hover:bg-surface-muted">
                Approve
              </button>
              <button className="rounded-control px-3 py-2 text-sm text-danger hover:bg-danger-soft">
                Suspend
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function priorityLabel(priority: number): string {
  if (priority === 1) return "Multiple reports";
  if (priority === 2) return "Scam signals";
  if (priority === 3) return "New user";
  return "Sample";
}

function priorityTone(priority: number) {
  if (priority === 1) return "danger" as const;
  if (priority === 2) return "warning" as const;
  if (priority === 3) return "info" as const;
  return "neutral" as const;
}
