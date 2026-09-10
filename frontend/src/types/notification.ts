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

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  targetType: NotificationTargetType;
  targetUserIds: string[];
  url: string | null;
  sentById: string;
  sentByName?: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  invalidRemoved: number;
  status: string;
  createdAt: string;
}

export interface NotificationLogDetail extends NotificationLog {
  recipients: { id: string; name: string; email: string | null }[];
}

export interface SendNotificationResult {
  id: string;
  recipients: number;
  successful: number;
  failed: number;
  invalidTokensRemoved: number;
  status: string;
}

export interface NotificationStatus {
  enabled: boolean;
  reachableUsers: number;
}
