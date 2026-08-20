import { ListingsTable } from "@/components/managing/listingstable";

export const metadata = { title: "Listings" };

type Search = Promise<{ status?: string }>;

export default async function Page({ searchParams }: { searchParams: Search }) {
  const { status } = await searchParams;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Listings
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every listing on the platform, in any state. Approvals happen in the
          approvals queue, not here.
        </p>
      </header>

      <ListingsTable initialStatus={status ?? ""} />
    </div>
  );
}
