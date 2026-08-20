"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getReport, resolveReport } from "@/lib/api/superadmin";
import type { Report } from "@/types/report";

export function ReportDetail({ id }: { id: string }) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getReport(id).then(setReport).catch((caught: unknown) =>
      setError(caught instanceof Error ? caught.message : "Could not load report"),
    );
  }, [id]);

  async function decide(outcome: "upheld" | "dismissed") {
    if (note.trim().length < 3) return;
    setBusy(true);
    setError(null);
    try {
      await resolveReport(id, outcome, note);
      router.push("/reports");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not resolve report");
      setBusy(false);
    }
  }

  if (error && !report) {
    return <div className="rounded-card border border-danger/20 bg-danger-soft p-4 text-sm text-danger">{error}</div>;
  }
  if (!report) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          {report.targetType} {report.targetId}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Reported for {report.reason}</p>
        <div className="mt-6 rounded-card border border-line bg-surface p-4 text-sm text-ink-muted">
          {report.detail || "No additional details were supplied."}
        </div>
      </div>
      <aside className="rounded-card border border-line bg-surface p-4">
        <Badge tone="warning">{report.status}</Badge>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <Textarea
          className="mt-4"
          label="Decision note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
        />
        <div className="mt-3 space-y-2">
          <Button fullWidth loading={busy} disabled={note.trim().length < 3} onClick={() => void decide("dismissed")}>
            Dismiss report
          </Button>
          <Button fullWidth variant="danger" disabled={busy || note.trim().length < 3} onClick={() => void decide("upheld")}>
            Uphold report
          </Button>
        </div>
      </aside>
    </div>
  );
}
