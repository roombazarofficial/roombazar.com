import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "rb_session";

const protectedPrefixes = ["/dashboard", "/post", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsSession = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!needsSession) return NextResponse.next();

  if (request.cookies.has(SESSION_COOKIE)) {
    /*
      Presence only. Whether the token is valid, expired or revoked is the
      API's judgement, and asking it here would put a network call in front of
      every page. The pages themselves render empty states if it turns out not
      to be a live session.
    */
    return NextResponse.next();
  }

  const url = new URL("/", request.url);
  url.searchParams.set("signin", "1");
  url.searchParams.set("next", pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/post/:path*", "/admin/:path*"],
};
