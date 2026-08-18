import Link from "next/link";
import { AdminSidebar } from "./adminsidebar";
import { routes } from "@/lib/constants/routes";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-line bg-ink">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link href={routes.admin} className="text-sm font-semibold text-ink-inverse">
            RoomBazar admin
          </Link>

          {}
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-2xs text-white/70">
            All actions are audited
          </span>

          <Link
            href={routes.home}
            className="ml-auto text-xs text-white/70 hover:text-white"
          >
            Back to site
          </Link>

        </div>

      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>

      </div>

    </div>

  );
}
