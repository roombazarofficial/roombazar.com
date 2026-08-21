import Link from "next/link";
import { ManagingSidebar } from "./managingsidebar";
import { SignOutButton } from "./signoutbutton";
import { ManagingTopbar } from "./managingtopbar";

/**
 * Chrome for the management console.
 *
 * Deliberately does not import from lib/constants/routes: those are the public
 * site's paths, and this app is served from a different hostname where they do
 * not resolve. The console owns its own small set of paths instead.
 */
const publicSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const logoUrl = new URL("/logo/rb-logo.png", publicSite).toString();

export function ManagingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface lg:block">
        <div className="flex h-full flex-col">
          <Link href="/" className="flex h-20 items-center gap-3 border-b border-line px-6">
            <img
              src={logoUrl}
              alt="RoomBazar"
              width={38}
              height={38}
              className="size-9 rounded-full object-contain"
            />
            <span className="text-base font-bold tracking-tight">
              Room<span className="text-brand-600">Bazar</span>
              <span className="block text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                Management
              </span>
            </span>
          </Link>
          <ManagingSidebar />
          <div className="mt-auto border-t border-line p-4">
            <div className="mb-3 flex items-center gap-3 rounded-card bg-surface-muted p-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                S
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">Super admin</p>
                <p className="text-xs text-ink-muted">Full access</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <ManagingTopbar publicSite={publicSite} logoUrl={logoUrl} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
