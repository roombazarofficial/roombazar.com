import { Injectable } from "@nestjs/common";
import type {
  AuthRepository,
  EmailCodeRecord,
  SessionRecord,
} from "src/persistence/ports/auth.repository";

@Injectable()
export class MemoryAuthRepository implements AuthRepository {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly codes = new Map<string, EmailCodeRecord>();

  async createSession(session: SessionRecord): Promise<SessionRecord> {
    this.sessions.set(session.id, session);
    return session;
  }

  async findLiveSession(tokenHash: string): Promise<SessionRecord | null> {
    for (const session of this.sessions.values()) {
      if (session.tokenHash !== tokenHash) continue;
      if (session.revokedAt) return null;
      if (new Date(session.expiresAt).getTime() < Date.now()) return null;
      return session;
    }
    return null;
  }

  async touchSession(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.set(id, { ...session, lastSeenAt: new Date().toISOString() });
    }
  }

  async revokeSession(tokenHash: string): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.tokenHash === tokenHash && !session.revokedAt) {
        this.sessions.set(id, { ...session, revokedAt: new Date().toISOString() });
      }
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.userId === userId && !session.revokedAt) {
        this.sessions.set(id, { ...session, revokedAt: new Date().toISOString() });
      }
    }
  }

  async listSessionsForUser(userId: string): Promise<SessionRecord[]> {
    return [...this.sessions.values()]
      .filter(
        (session) =>
          session.userId === userId &&
          !session.revokedAt &&
          new Date(session.expiresAt).getTime() > Date.now(),
      )
      .sort(
        (a, b) =>
          new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime(),
      );
  }

  async createEmailCode(record: EmailCodeRecord): Promise<EmailCodeRecord> {
    this.codes.set(record.id, record);
    return record;
  }

  async deleteEmailCode(id: string): Promise<void> {
    this.codes.delete(id);
  }

  async findLatestEmailCode(
    email: string,
    purpose: EmailCodeRecord["purpose"],
  ): Promise<EmailCodeRecord | null> {
    const matches = [...this.codes.values()]
      .filter(
        (code) =>
          code.email === email && code.purpose === purpose && !code.consumedAt,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return matches[0] ?? null;
  }

  async incrementCodeAttempts(id: string): Promise<number> {
    const code = this.codes.get(id);
    if (!code) return 0;

    const updated = { ...code, attempts: code.attempts + 1 };
    this.codes.set(id, updated);
    return updated.attempts;
  }

  async consumeEmailCode(id: string): Promise<void> {
    const code = this.codes.get(id);
    if (code) {
      this.codes.set(id, { ...code, consumedAt: new Date().toISOString() });
    }
  }

  async countRecentCodes(email: string, since: string): Promise<number> {
    return [...this.codes.values()].filter(
      (code) => code.email === email && code.createdAt >= since,
    ).length;
  }
}
