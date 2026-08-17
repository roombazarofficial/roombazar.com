import Link from "next/link";
import { cn } from "@/lib/utils/classnames";
import { mockQueue, mockReports } from "@/lib/api/mockmoderation";

export default function Page() {
  const openReports = mockReports.filter((item) => item.status === "open").length;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Admin overview
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Moderation queue"
          value={mockQueue.length}
          href="/admin/moderation"
          urgent={mockQueue.length > 3}
        />
        <Tile
          label="Open reports"
          value={openReports}
          href="/admin/reports"
          urgent={openReports > 2}
        />
        <Tile label="Verification requests" value={2} href="/admin/verification" />
        <Tile
          label="Locality requests"
          value={5}
          href="/admin/localities/requests"
        />
      </div>

      {/*
        Response targets are stated here rather than in a runbook nobody
        opens. Reporters are always told the outcome — silent reporting
        trains users to stop reporting.
      */}
      <section className="mt-8 rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">Response targets</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Scam and harassment reports</dt>
            <dd className="font-medium text-ink">Under 4 hours</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">All other reports</dt>
            <dd className="font-medium text-ink">Under 24 hours</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  href,
  urgent = false,
}: {
  label: string;
  value: number;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-raised"
    >
      <p className="text-xs text-ink-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-3xl font-semibold tabular-nums",
          urgent ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </p>
    </Link>
  );
}
