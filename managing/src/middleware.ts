import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "rb_session";

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const hasSession = request.cookies.has(SESSION_COOKIE);

  let response: NextResponse;

  if (isPublic) {
    response = hasSession
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  } else if (hasSession) {
    response = NextResponse.next();
  } else {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    response = NextResponse.redirect(login);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\..*).*)"],
};
