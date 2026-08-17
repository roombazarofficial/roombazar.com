import { DashboardShell } from "@/components/layout/dashboardshell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
