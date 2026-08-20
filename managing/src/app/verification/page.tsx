import { RequestQueue } from "@/components/managing/requestqueue";

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Verification queue</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Government ID, email and ownership requests awaiting review.
      </p>
      <RequestQueue kind="verification" />
    </div>

  );
}
