import { api } from "./client";

/** Client-component variant — call from a browser event handler. */
export function deleteAccountClient() {
  return api.delete("/users/me");
}
