import { ApprovalQueue } from "@/components/managing/approvalqueue";

export const metadata = { title: "Approvals" };

/**
 * The gate every room passes through before it is hosted.
 *
 * This is the screen the console is built around: nothing reaches a seeker
 * without someone deciding here, so it leads the navigation and is the one
 * place bulk actions exist.
 */
export default function Page() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Approvals
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Rooms waiting to be hosted, oldest first. Approving puts a listing in
          front of seekers immediately.
        </p>
      </header>

      <ApprovalQueue />
    </div>
  );
}
