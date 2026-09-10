import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  NOTIFICATIONS_REPOSITORY,
  type NotificationsRepository,
  type NotificationType,
} from "src/persistence/ports/notifications.repository";
import { FirebaseService, type FcmSendResult } from "./firebase.service";

export interface NotificationData {
  type?: NotificationType;
  url?: string;
  listingId?: string;
  chatId?: string;
  notificationId?: string;
}

export interface AppNotification {
  title: string;
  body: string;
  data?: NotificationData;
}

export interface DeliveryResult extends FcmSendResult {
  recipientTokenCount: number;
}

/**
 * Application-level notification API. Everything that wants to notify a person
 * — chat, listing approvals, the Super Admin console — goes through here, never
 * straight to {@link FirebaseService}. This is the layer that knows about users
 * and tokens; Firebase only knows about tokens.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repo: NotificationsRepository,
    private readonly firebase: FirebaseService,
  ) {}

  get enabled(): boolean {
    return this.firebase.enabled;
  }

  async sendToUser(
    userId: string,
    notification: AppNotification,
  ): Promise<DeliveryResult> {
    const tokens = await this.repo.activeTokensForUser(userId);
    return this.deliver(
      tokens.map((t) => t.token),
      notification,
    );
  }

  async sendToUsers(
    userIds: string[],
    notification: AppNotification,
  ): Promise<DeliveryResult> {
    const tokens = await this.repo.activeTokensForUsers(userIds);
    return this.deliver(
      tokens.map((t) => t.token),
      notification,
    );
  }

  async sendToAll(notification: AppNotification): Promise<DeliveryResult> {
    const tokens = await this.repo.allActiveTokens();
    return this.deliver(
      tokens.map((t) => t.token),
      notification,
    );
  }

  async sendToTokens(
    tokens: string[],
    notification: AppNotification,
  ): Promise<DeliveryResult> {
    return this.deliver(tokens, notification);
  }

  /**
   * Fire-and-forget wrapper for the automatic per-event triggers. A failed
   * notification must never fail the action that caused it (sending a message,
   * approving a listing), so callers use this and move on.
   */
  notifyUserInBackground(userId: string, notification: AppNotification): void {
    void this.sendToUser(userId, notification).catch((error) => {
      this.logger.error(
        `Background notification to ${userId} failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    });
  }

  private async deliver(
    tokens: string[],
    notification: AppNotification,
  ): Promise<DeliveryResult> {
    const unique = [...new Set(tokens.filter(Boolean))];

    if (unique.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
        recipientTokenCount: 0,
      };
    }

    const result = await this.firebase.sendToTokens(unique, {
      title: notification.title,
      body: notification.body,
      data: toStringMap(notification.data),
    });

    if (result.invalidTokens.length > 0) {
      await this.repo.deactivateTokens(result.invalidTokens);
    }

    return { ...result, recipientTokenCount: unique.length };
  }
}

/** FCM data values must all be strings; drop anything undefined. */
function toStringMap(
  data: NotificationData | undefined,
): Record<string, string> | undefined {
  if (!data) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) out[key] = String(value);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
