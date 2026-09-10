import { api } from "./client";
import type { Paginated } from "@/types/api";
import type {
  NotificationLog,
  NotificationLogDetail,
  NotificationStatus,
  NotificationType,
  SendNotificationResult,
} from "@/types/notification";

export interface RegisterTokenInput {
  token: string;
  deviceType?: "web" | "android" | "ios";
  browser?: string;
  installationId?: string;
}

export function registerPushToken(input: RegisterTokenInput) {
  return api.post<{ registered: boolean; deviceType: string }>(
    "/notifications/register-token",
    { deviceType: "web", ...input },
  );
}

// The shared api.delete() takes no body, so call the endpoint directly.
export async function unregisterToken(token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  await fetch(`${baseUrl}/api/notifications/unregister-token`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  }).catch(() => undefined);
}

// ---- Super Admin ----

export function getNotificationStatus() {
  return api.get<NotificationStatus>("/superadmin/notifications/status");
}

export interface SendNotificationInput {
  title: string;
  body: string;
  type: NotificationType;
  url?: string;
  target: "all" | "user" | "users";
  userIds?: string[];
  confirmAll?: boolean;
}

export function sendAdminNotification(input: SendNotificationInput) {
  return api.post<SendNotificationResult>(
    "/superadmin/notifications/send",
    input,
  );
}

export function getNotificationHistory(page = 1, pageSize = 20) {
  return api.get<Paginated<NotificationLog>>(
    `/superadmin/notifications/history?page=${page}&pageSize=${pageSize}`,
  );
}

export function getNotificationDetail(id: string) {
  return api.get<NotificationLogDetail>(`/superadmin/notifications/${id}`);
}

export interface AdminUserResult {
  id: string;
  name: string;
  email: string;
  trustLevel: string;
}

export async function searchUsers(query: string): Promise<AdminUserResult[]> {
  if (query.trim().length === 0) return [];
  const result = await api.get<Paginated<AdminUserResult>>(
    `/superadmin/users?query=${encodeURIComponent(query)}&pageSize=10`,
  );
  return result.items;
}
