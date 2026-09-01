import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/constants/routes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted/40">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href={routes.home}
            className="flex items-center gap-2 text-ink hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo/rb-logo.png"
              alt="RoomBazar"
              width={32}
              height={32}
              priority
              className="size-7 sm:size-8 rounded-full object-contain"
            />
            <span className="font-extrabold text-ink text-base sm:text-lg tracking-tight">
              Room<span className="text-brand-600">Bazar</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs font-medium text-ink-muted sm:inline-block">
              Posting is 100% free
            </span>
            <Link
              href={routes.dashboard}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted hover:border-line-strong hover:text-ink transition-colors"
            >
              Exit to dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
