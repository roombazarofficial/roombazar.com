import { SiteHeader } from "./siteheader";
import { SiteFooter } from "./sitefooter";

/**
 * Public page chrome.
 *
 * This is a plain component, not a Next.js layout, because the folder
 * structure avoids (parentheses) route groups. Public pages wrap their
 * content in it explicitly:
 *
 *   export default function Page() {
 *     return <SiteShell>…</SiteShell>;
 *   }
 *
 * The cost is one wrapper per public page. The benefit is that /dashboard
 * and /admin get their own chrome without fighting layout nesting.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
