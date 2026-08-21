import Link from "next/link";
import Image from "next/image";
import { WizardProgress } from "@/components/listingform/wizardprogress";
import { routes } from "@/lib/constants/routes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href={routes.home} className="inline-flex items-center">
            <Image
              src="/logo/rb-logo.png"
              alt="RoomBazar"
              width={34}
              height={34}
              priority
              className="size-8 rounded-full object-contain"
            />
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
