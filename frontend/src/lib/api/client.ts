import type { ApiError } from "@/types/api";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError,
  ) {
    super(body.message);
    this.name = "ApiRequestError";
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  revalidate?: number;
  /** Server components pass the incoming Cookie header through. */
  cookie?: string | null;
  timeoutMs?: number;
}

/*
  Without a deadline an unreachable or wedged API stalls a page render until
  Next gives up, turning one slow dependency into a failed build.
*/
const DEFAULT_TIMEOUT_MS = 10_000;

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, revalidate, cookie } = options;

  const response = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    /*
      The session is an httpOnly cookie set by the API. In the browser it only
      travels if credentials are included; on the server the cookie header is
      forwarded explicitly, because there is no cookie jar there.
    */
    credentials: "include",
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    ...(revalidate === undefined
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const parsed: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      (parsed as ApiError | null) ?? { code: "unknown", message: "Request failed" },
    );
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export async function tryGet<T>(
  path: string,
  fallback: T,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<T> {
  try {
    return await api.get<T>(path, options);
  } catch {
    return fallback;
  }
}
