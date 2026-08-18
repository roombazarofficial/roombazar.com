import Link from "next/link";
import { WizardProgress } from "@/components/listingform/wizardprogress";
import { routes } from "@/lib/constants/routes";
import { Logo } from "@/components/layout/logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo variant="wide" height={26} href={routes.home} />

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
