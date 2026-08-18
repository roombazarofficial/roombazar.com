import { SiteHeader } from "./siteheader";
import { SiteFooter } from "./sitefooter";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>

  );
}
