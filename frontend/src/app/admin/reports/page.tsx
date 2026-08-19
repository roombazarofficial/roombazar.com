import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mockReports } from "@/lib/api/mockmoderation";

export default function Page() {
  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Reports
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every reporter is told the outcome once a report is closed.
        </p>
      </header>

      {/* Wide tables scroll inside their own container so the page body never
          scrolls sideways on a narrow screen. */}
      <div className="mt-6 overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line text-left text-xs text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Target</th>
              <th scope="col" className="px-4 py-3 font-medium">Type</th>
              <th scope="col" className="px-4 py-3 font-medium">Reason</th>
              <th scope="col" className="px-4 py-3 font-medium">Reporter</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {mockReports.map((report) => (
              <tr key={report.id} className="hover:bg-surface-muted">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="text-ink hover:underline"
                  >
                    {report.target}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">{report.targetType}</td>
                <td className="px-4 py-3 text-ink-muted">{report.reason}</td>
                <td className="px-4 py-3 text-ink-muted">{report.reporter}</td>
                <td className="px-4 py-3">
                  <Badge tone={report.status === "open" ? "warning" : "success"}>
                    {report.status === "open" ? "Open" : "Resolved"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
