import { EmptyState } from "@/components/ui/emptystate";

export function AdminTablePlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>

        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>

      </header>

      <EmptyState
        className="mt-6"
        title="Waiting on the backend"
        description="This table renders once the admin endpoints exist. The screen it belongs to, and where it sits in the navigation, are settled."
      />

    </div>

  );
}
