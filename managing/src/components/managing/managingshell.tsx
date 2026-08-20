import Link from "next/link";
import { ManagingSidebar } from "./managingsidebar";
import { SignOutButton } from "./signoutbutton";

/**
 * Chrome for the management console.
 *
 * Deliberately does not import from lib/constants/routes: those are the public
 * site's paths, and this app is served from a different hostname where they do
 * not resolve. The console owns its own small set of paths instead.
 */
const publicSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function ManagingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-line bg-ink">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link href="/" className="text-sm font-semibold text-ink-inverse">
            RoomBazar management
          </Link>

          {/* A standing reminder that nothing done here is anonymous. */}
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-2xs text-white/70">
            All actions are audited
          </span>

          {/*
            An absolute URL, not a Link to "/". On this hostname every path is
            rewritten into the console, so a relative link home would land back
            on the dashboard rather than on the public site.
          */}
          <div className="ml-auto flex items-center gap-4">
            <a
              href={publicSite}
              className="text-xs text-white/70 hover:text-white"
              rel="noreferrer"
            >
              Public site
            </a>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
        <ManagingSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
