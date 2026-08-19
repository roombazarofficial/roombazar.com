import Link from "next/link";
import { DashboardSidebar } from "./dashboardsidebar";
import { DashboardMobileNav } from "./dashboardmobilenav";
import { routes } from "@/lib/constants/routes";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link href={routes.home} className="flex items-center gap-2 font-semibold tracking-tight text-ink">
            <img
              src="/logo/rb-logo.png"
              alt="RoomBazar"
              className="h-7 w-7 rounded-full"
            />
            <span>
              Room<span className="text-brand-600">Bazar</span>
            </span>
          </Link>
          <Link
            href={routes.post}
            className="ml-auto text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Post a room
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
