import { api, tryGet } from "./client";
import { serverApi, serverTryGet } from "./serverclient";
import type { CurrentUser, PublicUser } from "@/types/user";

export function getCurrentUser(): Promise<CurrentUser | null> {
  return serverTryGet<CurrentUser | null>("/users/me", null);
}

export function getPublicUser(id: string): Promise<PublicUser | null> {
  return tryGet<PublicUser | null>(`/users/${id}`, null);
}

export function updateProfile(patch: { name?: string; avatarUrl?: string | null }) {
  return serverApi.patch("/users/me", patch);
}

/** Server-component variant (reads the incoming request's cookie jar). */
export function deleteAccount() {
  return serverApi.delete("/users/me");
}

/** Client-component variant — call from a browser event handler. */
export function deleteAccountClient() {
  return api.delete("/users/me");
}
