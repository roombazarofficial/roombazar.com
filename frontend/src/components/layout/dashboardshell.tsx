import { SiteHeader } from "./siteheader";
import { DashboardSidebar } from "./dashboardsidebar";
import { DashboardMobileNav } from "./dashboardmobilenav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      <DashboardMobileNav />
    </div>
  );
}
