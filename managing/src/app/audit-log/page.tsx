import { AuditLogTable } from "@/components/managing/auditlogtable";

export const metadata = { title: "Audit log" };

export default function Page() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Append-only. Entries cannot be edited or removed, including by a super
          admin.
        </p>
      </header>

      <AuditLogTable />
    </div>
  );
}
