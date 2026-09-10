import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { Throttle } from "@nestjs/throttler";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { NotFound, ValidationFailed } from "src/common/errors/domain.errors";
import {
  NOTIFICATIONS_REPOSITORY,
  type NotificationsRepository,
} from "src/persistence/ports/notifications.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import type { User } from "src/domain/user.entity";
import { NotificationService } from "./notifications.service";

const NOTIFICATION_TYPES = [
  "CHAT_MESSAGE",
  "NEW_ENQUIRY",
  "LISTING_APPROVED",
  "LISTING_REJECTED",
  "LISTING_UPDATE",
  "NEW_MATCHING_LISTING",
  "SYSTEM_NOTIFICATION",
  "MARKETING",
] as const;

const sendSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    body: z.string().trim().min(3).max(500),
    type: z.enum(NOTIFICATION_TYPES).default("SYSTEM_NOTIFICATION"),
    url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || v.startsWith("/") || v.startsWith("https://"), {
        message: "URL must be a site path (/…) or an absolute https:// link",
      })
      .optional(),
    target: z.enum(["all", "user", "users"]),
    userIds: z.array(z.string().min(1)).max(500).optional(),
    confirmAll: z.boolean().optional(),
  })
  .superRefine((dto, ctx) => {
    if (dto.target === "user" && (dto.userIds?.length ?? 0) !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["userIds"], message: "Select one user" });
    }
    if (dto.target === "users" && (dto.userIds?.length ?? 0) < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["userIds"], message: "Select at least one user" });
    }
    if (dto.target === "all" && dto.confirmAll !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmAll"], message: "Confirm the all-users send" });
    }
  });

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * Super Admin notification console. Super admin only, enforced by the guard on
 * the class — hiding the button in the UI is not the control.
 */
@Controller("superadmin/notifications")
@SuperAdminOnly()
export class AdminNotificationsController {
  constructor(
    private readonly notifications: NotificationService,
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repo: NotificationsRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  /** Whether FCM is configured, plus how many people are reachable. */
  @Get("status")
  async status() {
    return {
      enabled: this.notifications.enabled,
      reachableUsers: await this.repo.countUsersWithActiveTokens(),
    };
  }

  @Throttle({ default: { ttl: 60_000, limit: 12 } })
  @Post("send")
  @HttpCode(200)
  async send(
    @Body(new ZodValidationPipe(sendSchema)) dto: z.infer<typeof sendSchema>,
    @CurrentUser() admin: User,
  ) {
    if (!this.notifications.enabled) {
      throw new ValidationFailed(
        "Push notifications are not configured yet. Add the Firebase credentials and redeploy.",
      );
    }

    const targetUserIds =
      dto.target === "all" ? [] : [...new Set(dto.userIds ?? [])];

    if (dto.target !== "all") {
      const found = await this.users.findManyByIds(targetUserIds);
      const missing = targetUserIds.filter((id) => !found.has(id));
      if (missing.length > 0) {
        throw new ValidationFailed(`Unknown user(s): ${missing.join(", ")}`);
      }
    }

    const url = dto.url && dto.url.length > 0 ? dto.url : null;

    const log = await this.repo.createLog({
      title: dto.title,
      body: dto.body,
      type: dto.type,
      targetType: dto.target,
      targetUserIds,
      url,
      sentById: admin.id,
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
      invalidRemoved: 0,
      status: "sent",
    });

    const notification = {
      title: dto.title,
      body: dto.body,
      data: {
        type: dto.type,
        notificationId: log.id,
        ...(url ? { url } : {}),
      },
    };

    const result =
      dto.target === "all"
        ? await this.notifications.sendToAll(notification)
        : await this.notifications.sendToUsers(targetUserIds, notification);

    const status =
      result.successCount === 0 && result.recipientTokenCount > 0
        ? "failed"
        : result.failureCount > 0
          ? "partial"
          : "sent";

    const updated = await this.repo.updateLog(log.id, {
      recipientCount: result.recipientTokenCount,
      successCount: result.successCount,
      failureCount: result.failureCount,
      invalidRemoved: result.invalidTokens.length,
      status,
    });

    return {
      id: updated.id,
      recipients: updated.recipientCount,
      successful: updated.successCount,
      failed: updated.failureCount,
      invalidTokensRemoved: updated.invalidRemoved,
      status: updated.status,
    };
  }

  @Get("history")
  async history(
    @Query(new ZodValidationPipe(historyQuerySchema))
    query: z.infer<typeof historyQuerySchema>,
  ) {
    const page = await this.repo.listLogs(query.page, query.pageSize);
    const senders = await this.users.findManyByIds(
      page.items.map((item) => item.sentById),
    );

    return {
      ...page,
      items: page.items.map((item) => ({
        ...item,
        sentByName: senders.get(item.sentById)?.name ?? "Unknown",
      })),
    };
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    const log = await this.repo.findLog(id);
    if (!log) throw new NotFound("Notification");

    const [sender, recipients] = await Promise.all([
      this.users.findManyByIds([log.sentById]),
      this.users.findManyByIds(log.targetUserIds),
    ]);

    return {
      ...log,
      sentByName: sender.get(log.sentById)?.name ?? "Unknown",
      recipients: log.targetUserIds.map((uid) => {
        const u = recipients.get(uid);
        return { id: uid, name: u?.name ?? "Unknown", email: u?.email ?? null };
      }),
    };
  }
}
