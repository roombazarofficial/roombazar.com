import type { Response } from "express";

export const SESSION_COOKIE = "rb_session";

const isProduction = process.env.NODE_ENV === "production";
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
  response.clearCookie(SESSION_COOKIE, {
    ...base,
    expires: new Date(0),
    maxAge: 0,
  });
}
