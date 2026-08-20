import { Injectable } from "@nestjs/common";
import type {
  AuthRepository,
  EmailCodeRecord,
  SessionRecord,
} from "src/persistence/ports/auth.repository";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(session: SessionRecord): Promise<SessionRecord> {
    const row = await this.prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        tokenHash: session.tokenHash,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        expiresAt: new Date(session.expiresAt),
      },
    });

    return toSession(row);
  }

  async findLiveSession(tokenHash: string): Promise<SessionRecord | null> {
    const row = await this.prisma.session.findUnique({ where: { tokenHash } });

    // Expiry and revocation are checked here rather than by the caller, so no
    // read path can accidentally accept a dead session.
    if (!row) return null;
    if (row.revokedAt) return null;
    if (row.expiresAt.getTime() < Date.now()) return null;

    return toSession(row);
  }

  async touchSession(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  async revokeSession(tokenHash: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async listSessionsForUser(userId: string): Promise<SessionRecord[]> {
    const rows = await this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: "desc" },
    });

    return rows.map(toSession);
  }

  async createEmailCode(record: EmailCodeRecord): Promise<EmailCodeRecord> {
    const row = await this.prisma.emailVerification.create({
      data: {
        id: record.id,
        email: record.email,
        codeHash: record.codeHash,
        purpose: record.purpose,
        expiresAt: new Date(record.expiresAt),
      },
    });

    return toCode(row);
  }

  async deleteEmailCode(id: string): Promise<void> {
    await this.prisma.emailVerification.deleteMany({ where: { id } });
  }

  async findLatestEmailCode(
    email: string,
    purpose: EmailCodeRecord["purpose"],
  ): Promise<EmailCodeRecord | null> {
    const row = await this.prisma.emailVerification.findFirst({
      where: { email, purpose, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return row ? toCode(row) : null;
  }

  async incrementCodeAttempts(id: string): Promise<number> {
    const row = await this.prisma.emailVerification.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });

    return row.attempts;
  }

  async consumeEmailCode(id: string): Promise<void> {
    await this.prisma.emailVerification.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async countRecentCodes(email: string, since: string): Promise<number> {
    return this.prisma.emailVerification.count({
      where: { email, createdAt: { gte: new Date(since) } },
    });
  }
}

function toSession(row: {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  lastSeenAt: Date;
  createdAt: Date;
}): SessionRecord {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    userAgent: row.userAgent,
    ipAddress: row.ipAddress,
    expiresAt: row.expiresAt.toISOString(),
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
    lastSeenAt: row.lastSeenAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function toCode(row: {
  id: string;
  email: string;
  codeHash: string;
  purpose: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}): EmailCodeRecord {
  return {
    id: row.id,
    email: row.email,
    codeHash: row.codeHash,
    purpose: row.purpose as EmailCodeRecord["purpose"],
    attempts: row.attempts,
    expiresAt: row.expiresAt.toISOString(),
    consumedAt: row.consumedAt ? row.consumedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}
