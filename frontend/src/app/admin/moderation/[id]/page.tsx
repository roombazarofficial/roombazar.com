import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getModerationQueue } from "@/lib/api/moderation";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const queue = await getModerationQueue();
  const item = queue.find((entry) => entry.id === id);
  if (!item) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          {item.targetType} {item.targetId}
        </h1>

        <p className="mt-1 text-sm text-ink-muted">
          Reported for: {item.reason}
        </p>

        {item.detail && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-ink">
              What the reporter said
            </h2>

            <p className="mt-2 rounded-control bg-surface-muted px-3 py-2 text-sm text-ink-muted">
              {item.detail}
            </p>

          </section>

        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Decision</h2>

          <Textarea
            className="mt-3"
            label="Note"
            hint="Required to suspend or restrict. Stored in the audit log and shown on appeal."
            maxLength={500}
          />

          <div className="mt-3 space-y-2">
            <Button fullWidth>Dismiss report</Button>

            <Button fullWidth variant="danger">
              Uphold and suspend
            </Button>

          </div>

        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Status</h2>

          <Badge tone="warning" className="mt-2">
            {item.status}
          </Badge>

        </div>

      </aside>

    </div>

  );
}
