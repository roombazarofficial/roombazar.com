"use client";

import { usePathname } from "next/navigation";
import { ManagingShell } from "./managingshell";

/**
 * Decides whether a page gets the console chrome.
 *
 * The sign-in screen must not: a sidebar full of links to places you cannot go
 * implies the console is already open to you, and the "Public site" link and
 * audit-log notice are noise to someone who is not through the door yet.
 *
 * A client component rather than a route group, because the console's routes
 * are all at the top level and grouping them would change every URL.
 */
const BARE_ROUTES = ["/login"];

export function ConsoleFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (BARE_ROUTES.includes(pathname)) return <>{children}</>;

  return <ManagingShell>{children}</ManagingShell>;
}
