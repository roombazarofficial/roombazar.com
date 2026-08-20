import { RequestQueue } from "@/components/managing/requestqueue";

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Locality requests</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Places requested by hosts that are not yet in the location list.
      </p>
      <RequestQueue kind="locality" />
    </div>

  );
}
