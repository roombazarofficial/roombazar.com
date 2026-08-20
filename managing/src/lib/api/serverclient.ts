import "server-only";
import { cookies } from "next/headers";

/**
 * Server-side API client.
 *
 * The console has two clients, and the split is deliberate:
 *
 *   - superadmin.ts runs in the browser and relies on `credentials: "include"`
 *     to send the session cookie.
 *   - this one runs in server components, where there is no cookie jar at all.
 *     The visitor's cookies have to be read off the incoming request and
 *     forwarded by hand, or every authenticated read comes back as a guest.
 *
 * Getting that wrong does not error — it quietly returns empty lists, which is
 * why the forwarding lives in one place rather than at each call site.
 */
const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  cookie?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${base}/api${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.cookie ? { cookie: options.cookie } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    // Console data is operational and changes as people work the queue; a
    // cached approval list would show rooms that were decided minutes ago.
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { code?: string; message?: string }
      | null;

    throw new ApiError(
      payload?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.code,
    );
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** Reads the incoming request's cookies so the API sees the operator. */
async function cookieHeader(): Promise<string> {
  const store = await cookies();

  return store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export const serverApi = {
  get: async <T>(path: string) =>
    request<T>(path, { method: "GET", cookie: await cookieHeader() }),

  post: async <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body, cookie: await cookieHeader() }),

  patch: async <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body, cookie: await cookieHeader() }),

  delete: async <T>(path: string) =>
    request<T>(path, { method: "DELETE", cookie: await cookieHeader() }),
};

/**
 * A read that degrades to a fallback instead of throwing.
 *
 * Used for list screens: an operator whose session has expired should see an
 * empty table and the sign-in redirect, not a Next.js error page that hides
 * what actually went wrong.
 */
export async function serverTryGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await serverApi.get<T>(path);
  } catch {
    return fallback;
  }
}
