import { Injectable } from "@nestjs/common";
import type { Page } from "src/persistence/ports/listings.repository";
import type {
  NotificationLogRecord,
  NotificationsRepository,
  PushTokenRecord,
  UpsertPushTokenInput,
} from "src/persistence/ports/notifications.repository";
import { PrismaService } from "./prisma.service";
import { isValidObjectId } from "./mappers";

type PushTokenRow = {
  id: string;
  userId: string;
  token: string;
  installationId: string | null;
  deviceType: string;
  browser: string | null;
  userAgent: string | null;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type NotificationLogRow = {
  id: string;
  title: string;
  body: string;
  type: string;
  targetType: string;
  targetUserIds: string[];
  url: string | null;
  sentById: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  invalidRemoved: number;
  status: string;
  createdAt: Date;
};

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertToken(input: UpsertPushTokenInput): Promise<PushTokenRecord> {
    const row = await this.prisma.pushToken.upsert({
      where: { token: input.token },
      create: {
        userId: input.userId,
        token: input.token,
        installationId: input.installationId ?? null,
        deviceType: input.deviceType ?? "web",
        browser: input.browser ?? null,
        userAgent: input.userAgent ?? null,
        isActive: true,
        lastUsedAt: new Date(),
      },
      update: {
        // Re-point the token at whoever is registering it now. This is the
        // safeguard against a shared browser delivering one user's
        // notifications to the next person who signs in.
        userId: input.userId,
        installationId: input.installationId ?? undefined,
        deviceType: input.deviceType ?? undefined,
        browser: input.browser ?? undefined,
        userAgent: input.userAgent ?? undefined,
        isActive: true,
        lastUsedAt: new Date(),
      },
    });

    return toTokenRecord(row);
  }

  async deactivateOwnToken(userId: string, token: string): Promise<void> {
    await this.prisma.pushToken.updateMany({
      where: { token, userId },
      data: { isActive: false },
    });
  }

  async deactivateTokens(tokens: string[]): Promise<number> {
    if (tokens.length === 0) return 0;
    const result = await this.prisma.pushToken.updateMany({
      where: { token: { in: tokens }, isActive: true },
      data: { isActive: false },
    });
    return result.count;
  }

  async activeTokensForUser(userId: string): Promise<PushTokenRecord[]> {
    const rows = await this.prisma.pushToken.findMany({
      where: { userId, isActive: true },
    });
    return rows.map(toTokenRecord);
  }

  async activeTokensForUsers(userIds: string[]): Promise<PushTokenRecord[]> {
    if (userIds.length === 0) return [];
    const rows = await this.prisma.pushToken.findMany({
      where: { userId: { in: [...new Set(userIds)] }, isActive: true },
    });
    return rows.map(toTokenRecord);
  }

  async allActiveTokens(): Promise<PushTokenRecord[]> {
    const rows = await this.prisma.pushToken.findMany({
      where: { isActive: true },
    });
    return rows.map(toTokenRecord);
  }

  async countUsersWithActiveTokens(): Promise<number> {
    const rows = await this.prisma.pushToken.findMany({
      where: { isActive: true },
      select: { userId: true },
    });
    return new Set(rows.map((r) => r.userId)).size;
  }

  async createLog(
    record: Omit<NotificationLogRecord, "id" | "createdAt">,
  ): Promise<NotificationLogRecord> {
    const row = await this.prisma.notificationLog.create({
      data: {
        title: record.title,
        body: record.body,
        type: record.type,
        targetType: record.targetType,
        targetUserIds: record.targetUserIds.filter(isValidObjectId),
        url: record.url,
        sentById: record.sentById,
        recipientCount: record.recipientCount,
        successCount: record.successCount,
        failureCount: record.failureCount,
        invalidRemoved: record.invalidRemoved,
        status: record.status,
      },
    });
    return toLogRecord(row);
  }

  async updateLog(
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
  ): Promise<NotificationLogRecord> {
    const row = await this.prisma.notificationLog.update({
      where: { id },
      data: patch,
    });
    return toLogRecord(row);
  }

  async findLog(id: string): Promise<NotificationLogRecord | null> {
    if (!isValidObjectId(id)) return null;
    const row = await this.prisma.notificationLog.findUnique({ where: { id } });
    return row ? toLogRecord(row) : null;
  }

  async listLogs(
    page: number,
    pageSize: number,
  ): Promise<Page<NotificationLogRecord>> {
    const [totalItems, rows] = await Promise.all([
      this.prisma.notificationLog.count(),
      this.prisma.notificationLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map(toLogRecord),
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    };
  }
}

function toTokenRecord(row: PushTokenRow): PushTokenRecord {
  return {
    id: row.id,
    userId: row.userId,
    token: row.token,
    installationId: row.installationId,
    deviceType: row.deviceType as PushTokenRecord["deviceType"],
    browser: row.browser,
    userAgent: row.userAgent,
    isActive: row.isActive,
    lastUsedAt: row.lastUsedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toLogRecord(row: NotificationLogRow): NotificationLogRecord {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type as NotificationLogRecord["type"],
    targetType: row.targetType as NotificationLogRecord["targetType"],
    targetUserIds: row.targetUserIds,
    url: row.url,
    sentById: row.sentById,
    recipientCount: row.recipientCount,
    successCount: row.successCount,
    failureCount: row.failureCount,
    invalidRemoved: row.invalidRemoved,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
