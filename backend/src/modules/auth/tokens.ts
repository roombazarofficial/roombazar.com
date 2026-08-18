import { createHash, randomBytes, randomInt } from "node:crypto";

/** Session tokens are opaque and long; only their hash reaches the database. */
export function createSessionToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Six digits, from a cryptographic source.
 *
 * Math.random would be predictable enough to guess a code given a few samples,
 * and this one is the only thing guarding account creation.
 */
export function createEmailCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}
