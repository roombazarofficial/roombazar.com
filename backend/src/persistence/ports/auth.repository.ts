export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  revokedAt: string | null;
  lastSeenAt: string;
  createdAt: string;
}

export interface EmailCodeRecord {
  id: string;
  email: string;
  codeHash: string;
  purpose: "signup" | "passwordreset";
  attempts: number;
  expiresAt: string;
  consumedAt: string | null;
  createdAt: string;
}

export interface AuthRepository {
  createSession(session: SessionRecord): Promise<SessionRecord>;
  /** Resolves a presented token. Returns null when expired or revoked. */
  findLiveSession(tokenHash: string): Promise<SessionRecord | null>;
  touchSession(id: string): Promise<void>;
  revokeSession(tokenHash: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  listSessionsForUser(userId: string): Promise<SessionRecord[]>;

  createEmailCode(record: EmailCodeRecord): Promise<EmailCodeRecord>;
  deleteEmailCode(id: string): Promise<void>;
  /** The newest unconsumed code for this address and purpose. */
  findLatestEmailCode(
    email: string,
    purpose: EmailCodeRecord["purpose"],
  ): Promise<EmailCodeRecord | null>;
  incrementCodeAttempts(id: string): Promise<number>;
  consumeEmailCode(id: string): Promise<void>;
  /** Codes issued to this address since a time, for throttling resends. */
  countRecentCodes(email: string, since: string): Promise<number>;
}
