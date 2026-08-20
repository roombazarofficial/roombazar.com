import { ReferenceDataTable } from "@/components/managing/referencedatatable";

export const metadata = { title: "Amenities" };

export default function Page() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Amenities
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          The fixed set offered in the post wizard and the search filters.
        </p>
      </header>

      <ReferenceDataTable kind="amenities" />
    </div>
  );
}
