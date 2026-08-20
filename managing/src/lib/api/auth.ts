const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Sign-in for the console.
 *
 * The console signs people in itself rather than bouncing them to the public
 * site. Two reasons: an operator arriving at the management domain should not
 * be thrown onto the customer-facing site to get in, and the redirect
 * round-trip loses whichever screen they were trying to reach.
 *
 * The session cookie is set by the API and is shared across the site, the
 * console and the API — locally because cookies ignore ports, and in production
 * because sibling subdomains of one registrable domain are same-site.
 */

export interface SignedInUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "moderator" | "admin" | "superadmin";
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${base}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Without this the Set-Cookie on the response is discarded and the sign-in
    // appears to succeed while leaving the browser with no session.
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    throw new AuthError(
      typeof payload?.message === "string"
        ? payload.message
        : `Sign in failed (${response.status})`,
      response.status,
      typeof payload?.code === "string" ? payload.code : undefined,
    );
  }

  return payload as T;
}

export function login(email: string, password: string) {
  return call<{ user: SignedInUser }>("/auth/login", { email, password });
}

export function logout() {
  return call<unknown>("/auth/logout");
}

/**
 * Who the session belongs to.
 *
 * Used after sign-in to check the account is actually a super admin, so the
 * refusal is explained on the login screen rather than as an empty dashboard
 * with a "route not found" error.
 */
export async function me(): Promise<SignedInUser | null> {
  const response = await fetch(`${base}/api/users/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;

  return (await response.json()) as SignedInUser;
}
