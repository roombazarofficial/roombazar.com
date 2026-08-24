import type { CookieOptions, Response } from "express";

export const SESSION_COOKIE = "rb_session";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(process.env.COOKIE_DOMAIN
      ? { domain: process.env.COOKIE_DOMAIN }
      : {}),
  };
}

export function setSessionCookie(
  response: Response,
  token: string,
  expiresAt: string,
): void {
  response.cookie(SESSION_COOKIE, token, {
    ...cookieOptions(),
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE, {
    ...cookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}
