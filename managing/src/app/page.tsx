import { ManagingDashboard } from "@/components/managing/managingdashboard";

export const metadata = { title: "Super admin" };

export default function Page() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Super admin
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every action taken here is written to the audit log.
        </p>
      </header>

      <ManagingDashboard />
    </div>
  );
}
