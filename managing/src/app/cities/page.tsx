import { ReferenceDataTable } from "@/components/managing/referencedatatable";

export const metadata = { title: "Cities" };

export default function Page() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Cities
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Opening a city needs a seeded locality list before it is useful to
          anyone.
        </p>
      </header>

      <ReferenceDataTable kind="cities" />
    </div>
  );
}
