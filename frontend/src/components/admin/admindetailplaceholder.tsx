import { EmptyState } from "@/components/ui/emptystate";

/** Detail route frame. See admintableplaceholder for why these stay thin. */
export function AdminDetailPlaceholder({ id }: { id: string }) {
  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Record {id}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Full record with its moderation history and available actions.
        </p>
      </header>

      <EmptyState
        className="mt-6"
        title="Waiting on the backend"
        description="This view renders once the admin endpoints exist."
      />
    </div>
  );
}
