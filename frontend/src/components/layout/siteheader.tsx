import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link
          href={routes.home}
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Room<span className="text-brand-600">Bazar</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link
            href={routes.rooms}
            className="rounded-control px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            Browse rooms
          </Link>
          <Link
            href={routes.safety}
            className="rounded-control px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            Staying safe
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/*
            "Post a room" stays visible at every breakpoint. Supply is the
            harder side of this marketplace to grow, so the action that adds
            it is never the one that collapses into a menu.
          */}
          <Link
            href={routes.post}
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            Post a room
          </Link>

          <Link
            href={routes.login}
            className={buttonStyles({
              variant: "ghost",
              size: "sm",
              className: "hidden sm:inline-flex",
            })}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
