import "server-only";
import { cookies } from "next/headers";
import { request, type RequestOptions } from "./client";

/**
 * Server-side calls carry the visitor's session by forwarding their cookie
 * header. There is no cookie jar on the server, so without this every
 * authenticated read from a server component would come back as a guest.
 */
async function cookieHeader(): Promise<string> {
  const store = await cookies();

  return store
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export const serverApi = {
  get: async <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET", cookie: await cookieHeader() }),

  post: async <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body, cookie: await cookieHeader() }),

  patch: async <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body, cookie: await cookieHeader() }),

  delete: async <T>(path: string) =>
    request<T>(path, { method: "DELETE", cookie: await cookieHeader() }),
};

export async function serverTryGet<T>(
  path: string,
  fallback: T,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<T> {
  try {
    return await serverApi.get<T>(path, options);
  } catch {
    return fallback;
  }
}
