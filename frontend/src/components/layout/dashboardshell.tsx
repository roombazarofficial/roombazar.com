import Link from "next/link";
import { DashboardSidebar } from "./dashboardsidebar";
import { DashboardMobileNav } from "./dashboardmobilenav";
import { routes } from "@/lib/constants/routes";
import { Logo } from "@/components/layout/logo";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Logo variant="wide" height={28} href={routes.home} />

          <Link
            href={routes.post}
            className="ml-auto text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Host a room
          </Link>

        </div>

      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>

      </div>

      <DashboardMobileNav />
    </div>

  );
}
