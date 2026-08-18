"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Button, buttonStyles } from "@/components/ui/button";
import { useAuthUi } from "@/store/authuistore";
import { logout } from "@/lib/api/auth";
import { routes } from "@/lib/constants/routes";

export function SiteHeader() {
  const router = useRouter();
  const { user, loaded, openSignIn, setUser } = useAuthUi();

  function postRoom() {
    if (user) {
      router.push(routes.post);
      return;
    }

    openSignIn({
      intent: "Sign in to post your room. It takes about a minute.",
      next: routes.post,
    });
  }

  async function signOut() {
    await logout().catch(() => undefined);
    setUser(null);
    router.push(routes.home);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo variant="wide" height={30} href={routes.home} />

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
          <Button variant="primary" size="sm" onClick={postRoom}>
            Post a room
          </Button>

          {!loaded ? (
            <span
              aria-hidden
              className="hidden h-9 w-20 animate-pulse rounded-control bg-surface-sunken sm:block"
            />
          ) : user ? (
            <>
              <Link
                href={routes.dashboard}
                className={buttonStyles({
                  variant: "ghost",
                  size: "sm",
                  className: "hidden sm:inline-flex",
                })}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="hidden rounded-control px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink sm:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => openSignIn()}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
