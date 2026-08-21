import { ReferenceDataTable } from "@/components/managing/referencedatatable";

export const metadata = { title: "Localities" };

type Search = Promise<{ new?: string }>;

export default async function Page({ searchParams }: { searchParams: Search }) {
  const { new: create } = await searchParams;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Localities
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          The alias list matters most: without it, alternate spellings fragment
          search and both sides of the market stop finding each other.
        </p>
      </header>

      <ReferenceDataTable kind="localities" initialCreate={create === "1"} />
    </div>
  );
}
