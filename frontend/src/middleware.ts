import { NextResponse, type NextRequest } from "next/server";

/**
 * NOTE: this file must live at src/middleware.ts — a sibling of src/app.
 * Placed at the project root next to next.config.ts it is silently ignored,
 * with no build error and no warning.
 */

const SESSION_COOKIE = "rb_session";

/** Signed-out users are bounced from these prefixes to /login. */
const protectedPrefixes = ["/dashboard", "/post", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsSession = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!needsSession) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Presence of the cookie is only a cheap gate. Role checks for /admin and
  // ownership checks for /dashboard must still happen server-side, because a
  // cookie being present says nothing about whether it is valid.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/post/:path*", "/admin/:path*"],
};
