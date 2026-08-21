import { api } from "./client";
import type { CurrentUser } from "@/types/user";

export interface LookupResult {
  registered: boolean;
}

/** Decides which form to show, so the address is typed once. */
export function lookupEmail(email: string): Promise<LookupResult> {
  return api.post<LookupResult>("/auth/lookup", { email });
}

export function startSignup(email: string) {
  return api.post<{ sent: boolean }>("/auth/signup/start", { email });
}

export function completeSignup(input: {
  email: string;
  code: string;
  password: string;
  name: string;
}) {
  return api.post<{ user: CurrentUser }>("/auth/signup/complete", input);
}

export function login(input: { email: string; password: string }) {
  return api.post<{ user: CurrentUser }>("/auth/login", input);
}

export function logout() {
  return api.post<void>("/auth/logout");
}

export function requestPasswordReset(email: string) {
  return api.post<{ sent: boolean }>("/auth/password/reset/request", { email });
}

export function confirmPasswordReset(input: {
  email: string;
  code: string;
  password: string;
}) {
  return api.post<void>("/auth/password/reset/confirm", input);
}

export function fetchCurrentUser(): Promise<CurrentUser | null> {
  return api.get<CurrentUser | null>("/users/me").catch(() => null);
}

export function updateProfile(input: { name?: string; avatarUrl?: string | null }) {
  return api.patch<CurrentUser>("/users/me", input);
}
