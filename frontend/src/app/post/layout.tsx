import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/constants/routes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted/40">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={routes.home}
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              title="Return to Home"
            >
              <span className="text-lg leading-none transition-transform group-hover:-translate-x-0.5">←</span>
              <Image
                src="/logo/rb-logo.png"
                alt="RoomBazar"
                width={30}
                height={30}
                priority
                className="size-7 rounded-full object-contain"
              />
              <span className="font-semibold text-ink hidden sm:inline">RoomBazar</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={routes.dashboard}
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Save & Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
