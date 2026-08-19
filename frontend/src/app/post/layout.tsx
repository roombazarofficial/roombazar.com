import Link from "next/link";
import { WizardProgress } from "@/components/listingform/wizardprogress";
import { routes } from "@/lib/constants/routes";

/**
 * The wizard gets its own minimal chrome rather than the public header.
 * Fewer exits on screen means fewer half-finished listings.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href={routes.home} className="font-semibold tracking-tight text-ink">
            Room<span className="text-brand-600">Bazar</span>
          </Link>
          <Link
            href={routes.dashboard}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Save and exit
          </Link>
        </div>
      </header>

      <WizardProgress />

      <main className="flex-1">{children}</main>
    </div>
  );
}
