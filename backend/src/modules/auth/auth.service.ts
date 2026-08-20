import { Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
  type EmailCodeRecord,
} from "src/persistence/ports/auth.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  Forbidden,
  MailDeliveryFailed,
  RateLimited,
  ValidationFailed,
} from "src/common/errors/domain.errors";
import { MailService } from "src/modules/mail/mail.service";
import {
  passwordResetEmail,
  verificationEmail,
} from "src/modules/mail/templates";
import type { User } from "src/domain/user.entity";
import { hashPassword, passwordProblem, verifyPassword } from "./password";
import { createEmailCode, createSessionToken, hashCode, hashToken } from "./tokens";

const CODE_TTL_MINUTES = 10;
const SESSION_TTL_DAYS = 30;
const MAX_CODE_ATTEMPTS = 5;
const MAX_CODES_PER_HOUR = 5;

export interface SessionContext {
  userAgent: string | null;
  ipAddress: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AUTH_REPOSITORY) private readonly auth: AuthRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    private readonly mail: MailService,
  ) {}

  /**
   * Tells the client which form to show next.
   *
   * Deliberately leaks whether an address is registered. That is a real
   * trade-off: the alternative is asking everyone for a password and failing
   * unhelpfully for new users, or sending a code to people who have an account
   * and a password. Any sign-up form reveals the same thing by rejecting a
   * duplicate address, so the disclosure is not new — it is just honest here.
   */
  async lookup(email: string): Promise<{ registered: boolean }> {
    const existing = await this.users.findByEmail(email);
    return { registered: Boolean(existing && !existing.deletedAt) };
  }

  async startSignup(email: string): Promise<void> {
    const existing = await this.users.findByEmail(email);

    if (existing && !existing.deletedAt) {
      throw new ValidationFailed("That email already has an account.", {
        email: "Sign in instead.",
      });
    }

    await this.issueCode(email, "signup");
  }

  async completeSignup(
    input: { email: string; code: string; password: string; name: string },
    context: SessionContext,
  ): Promise<{ user: User; token: string; expiresAt: string }> {
    const problem = passwordProblem(input.password);
    if (problem) {
      throw new ValidationFailed(problem, { password: problem });
    }

    await this.consumeCode(input.email, input.code, "signup");

    // Re-checked after the code is consumed: two tabs could both have valid
    // codes, and the second must not create a duplicate account.
    const existing = await this.users.findByEmail(input.email);

    if (existing && !existing.deletedAt) {
      throw new ValidationFailed("That email already has an account.", {
        email: "Sign in instead.",
      });
    }

    const now = new Date().toISOString();

    const user = await this.users.create({
      id: randomUUID(),
      email: input.email,
      emailVerifiedAt: now,
      passwordHash: await hashPassword(input.password),
      phone: null,
      phoneVerifiedAt: null,
      name: input.name,
      avatarUrl: null,
      role: "user",
      trustLevel: "new",
      verifications: ["email"],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const session = await this.openSession(user.id, context);

    return { user, ...session };
  }

  async login(
    input: { email: string; password: string },
    context: SessionContext,
  ): Promise<{ user: User; token: string; expiresAt: string }> {
    const user = await this.users.findByEmail(input.email);

    /*
      One message and one code path for "no such account" and "wrong password".
      Distinguishing them turns the login form into a way to enumerate which
      addresses are registered.
    */
    const invalid = new ValidationFailed("Email or password is incorrect.", {
      password: "Email or password is incorrect.",
    });

    if (!user || user.deletedAt) {
      // Still spend the time a real verification would, so a missing account
      // cannot be detected by how quickly the request comes back.
      await verifyPassword(input.password, DUMMY_HASH);
      throw invalid;
    }

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw invalid;

    if (user.trustLevel === "restricted") {
      throw new Forbidden("This account is under review.");
    }

    const session = await this.openSession(user.id, context);

    return { user, ...session };
  }

  async resolveSession(token: string): Promise<User | null> {
    const record = await this.auth.findLiveSession(hashToken(token));
    if (!record) return null;

    const user = await this.users.findById(record.userId);
    if (!user || user.deletedAt) return null;

    // Fire and forget: a failed bookkeeping write must not fail the request.
    void this.auth.touchSession(record.id);

    return user;
  }

  async logout(token: string): Promise<void> {
    await this.auth.revokeSession(hashToken(token));
  }

  async logoutEverywhere(userId: string): Promise<void> {
    await this.auth.revokeAllForUser(userId);
  }

  async listSessions(userId: string) {
    return this.auth.listSessionsForUser(userId);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);

    /*
      Always reports success. Saying "no account with that email" here would
      turn the reset form into an address checker, and the person who genuinely
      mistyped will notice when no mail arrives.
    */
    if (!user || user.deletedAt) {
      this.logger.log(`Password reset requested for unknown address`);
      return;
    }

    await this.issueCode(email, "passwordreset");
  }

  async confirmPasswordReset(input: {
    email: string;
    code: string;
    password: string;
  }): Promise<void> {
    const problem = passwordProblem(input.password);
    if (problem) {
      throw new ValidationFailed(problem, { password: problem });
    }

    await this.consumeCode(input.email, input.code, "passwordreset");

    const user = await this.users.findByEmail(input.email);
    if (!user || user.deletedAt) {
      throw new ValidationFailed("That reset link is no longer valid.");
    }

    await this.users.update(user.id, {
      passwordHash: await hashPassword(input.password),
    });

    /*
      Every other session goes. A password reset is what someone does when they
      suspect an intruder, and leaving the intruder's session alive would defeat
      the entire point.
    */
    await this.auth.revokeAllForUser(user.id);
  }

  private async issueCode(
    email: string,
    purpose: EmailCodeRecord["purpose"],
  ): Promise<void> {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = await this.auth.countRecentCodes(email, since);

    if (recent >= MAX_CODES_PER_HOUR) {
      throw new RateLimited(
        "Too many codes requested. Try again in an hour.",
      );
    }

    const code = createEmailCode();
    const expiresAt = new Date(
      Date.now() + CODE_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    const record: EmailCodeRecord = {
      id: randomUUID(),
      email,
      codeHash: hashCode(code),
      purpose,
      attempts: 0,
      expiresAt,
      consumedAt: null,
      createdAt: new Date().toISOString(),
    };

    await this.auth.createEmailCode(record);

    try {
      await this.mail.send(
        purpose === "signup"
          ? verificationEmail(email, code, CODE_TTL_MINUTES)
          : passwordResetEmail(email, code, CODE_TTL_MINUTES),
      );
    } catch (error) {
      await this.auth.deleteEmailCode(record.id);

      this.logger.error(
        `Mail delivery failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );

      throw new MailDeliveryFailed();
    }
  }

  private async consumeCode(
    email: string,
    code: string,
    purpose: EmailCodeRecord["purpose"],
  ): Promise<void> {
    const record = await this.auth.findLatestEmailCode(email, purpose);

    const wrong = new ValidationFailed("That code is wrong or has expired.", {
      code: "That code is wrong or has expired.",
    });

    if (!record) throw wrong;

    if (new Date(record.expiresAt).getTime() < Date.now()) throw wrong;

    if (record.attempts >= MAX_CODE_ATTEMPTS) {
      throw new RateLimited("Too many attempts. Request a new code.");
    }

    if (record.codeHash !== hashCode(code)) {
      await this.auth.incrementCodeAttempts(record.id);
      throw wrong;
    }

    // Consumed on first success, so a code cannot be replayed.
    await this.auth.consumeEmailCode(record.id);
  }

  private async openSession(
    userId: string,
    context: SessionContext,
  ): Promise<{ token: string; expiresAt: string }> {
    const { token, hash } = createSessionToken();

    const expiresAt = new Date(
      Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    await this.auth.createSession({
      id: randomUUID(),
      userId,
      tokenHash: hash,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
      revokedAt: null,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return { token, expiresAt };
  }
}

/**
 * A real scrypt hash of a value nobody uses, so the unknown-account path costs
 * the same as a genuine password check.
 */
const DUMMY_HASH =
  "scrypt$32768$8$1$1bkl4Eu9YiyGwFnA77zcBA==$3jqaz1BMw6BKvpFvQ8vQ68EW1Td88bEPbqQi5kOrJpCAnPqBqKsyT3K6/fEyk+zg3Pm2ruUPEteg8SD/eToHow==";
