import type { Page } from "src/persistence/ports/listings.repository";

export const NOTIFICATIONS_REPOSITORY = Symbol("NOTIFICATIONS_REPOSITORY");

export type DeviceType = "web" | "android" | "ios";

export type NotificationType =
  | "CHAT_MESSAGE"
  | "NEW_ENQUIRY"
  | "LISTING_APPROVED"
  | "LISTING_REJECTED"
  | "LISTING_UPDATE"
  | "NEW_MATCHING_LISTING"
  | "SYSTEM_NOTIFICATION"
  | "MARKETING";

export type NotificationTargetType = "all" | "user" | "users";

export interface PushTokenRecord {
  id: string;
  userId: string;
  token: string;
  installationId: string | null;
  deviceType: DeviceType;
  browser: string | null;
  userAgent: string | null;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertPushTokenInput {
  userId: string;
  token: string;
  installationId?: string | null;
  deviceType?: DeviceType;
  browser?: string | null;
  userAgent?: string | null;
}

export interface NotificationLogRecord {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  targetType: NotificationTargetType;
  targetUserIds: string[];
  url: string | null;
  sentById: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  invalidRemoved: number;
  status: string;
  createdAt: string;
}

export interface NotificationsRepository {
  /**
   * Registers or refreshes a token. Keyed on the token itself, so the same
   * browser re-registering — even under a different user — updates the one row
   * and its owner rather than leaving a stale mapping behind.
   */
  upsertToken(input: UpsertPushTokenInput): Promise<PushTokenRecord>;

  /** Deactivate one token, scoped to its owner (logout on this device). */
  deactivateOwnToken(userId: string, token: string): Promise<void>;

  /** Deactivate tokens FCM has told us are dead. Returns how many changed. */
  deactivateTokens(tokens: string[]): Promise<number>;

  activeTokensForUser(userId: string): Promise<PushTokenRecord[]>;
  activeTokensForUsers(userIds: string[]): Promise<PushTokenRecord[]>;
  /** Every active token. Used only by the "all users" broadcast. */
  allActiveTokens(): Promise<PushTokenRecord[]>;
  countUsersWithActiveTokens(): Promise<number>;

  createLog(
    record: Omit<NotificationLogRecord, "id" | "createdAt">,
  ): Promise<NotificationLogRecord>;
  updateLog(
    id: string,
    patch: Partial<
      Pick<
        NotificationLogRecord,
        | "recipientCount"
        | "successCount"
        | "failureCount"
        | "invalidRemoved"
        | "status"
      >
    >,
  ): Promise<NotificationLogRecord>;
  findLog(id: string): Promise<NotificationLogRecord | null>;
  listLogs(page: number, pageSize: number): Promise<Page<NotificationLogRecord>>;
}
