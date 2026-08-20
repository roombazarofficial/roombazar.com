import type { Response } from "express";

export const SESSION_COOKIE = "rb_session";

const isProduction = process.env.NODE_ENV === "production";

/*
  httpOnly so no script can read the token, which is what makes an XSS bug fall
  short of full account takeover. SameSite=Lax is enough here because the API
  and the site are same-site — different ports and sibling subdomains both
  qualify — and it blocks the cross-site request forgery that "none" would open.
*/
const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
};

export function setSessionCookie(
  response: Response,
  token: string,
  expiresAt: string,
): void {
  response.cookie(SESSION_COOKIE, token, {
    ...base,
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE, base);
}
