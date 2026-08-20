import { UsersTable } from "@/components/managing/userstable";

export const metadata = { title: "Users" };

type Search = Promise<{ role?: string }>;

export default async function Page({ searchParams }: { searchParams: Search }) {
  const { role } = await searchParams;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Users
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Accounts, roles and trust levels. Role changes are audited.
        </p>
      </header>

      <UsersTable initialRole={role ?? ""} />
    </div>
  );
}
