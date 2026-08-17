import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mockQueue } from "@/lib/api/mockmoderation";
import { formatRupees } from "@/lib/format/rupees";

type Params = Promise<{ id: string }>;

/**
 * Single-listing review.
 *
 * The decision buttons are deliberately asymmetric: approving is one click,
 * suspending requires a note. A suspension hides someone's listing and moves
 * their account toward RESTRICTED, and the note is what makes that reviewable
 * on appeal — an audit row saying only "suspended" is not accountability.
 */
export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const item = mockQueue.find((entry) => entry.id === id);
  if (!item) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          {item.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatRupees(item.rentPaise)}/month · {item.localityName} ·{" "}
          {item.listerName} ({item.listerAge})
        </p>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Why this was flagged</h2>
          <ul className="mt-2 space-y-1.5">
            {item.flags.map((flag) => (
              <li
                key={flag}
                className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger"
              >
                {flag}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Photos</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="flex aspect-4/3 items-center justify-center rounded-control bg-surface-sunken text-xs text-ink-subtle"
              >
                Photo {index + 1}
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Decision</h2>

          <Textarea
            className="mt-3"
            label="Note"
            hint="Required for suspend. Stored in the audit log and shown on appeal."
            maxLength={500}
            showCount
          />

          <div className="mt-3 space-y-2">
            <Button fullWidth>Approve</Button>
            <Button fullWidth variant="secondary">
              Ask lister to fix
            </Button>
            <Button fullWidth variant="danger">
              Suspend listing
            </Button>
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Lister</h2>
          <p className="mt-2 text-sm text-ink">{item.listerName}</p>
          <p className="text-xs text-ink-muted">{item.listerAge}</p>
          <Badge tone="warning" className="mt-2">
            Trust level: new
          </Badge>
        </div>
      </aside>
    </div>
  );
}
