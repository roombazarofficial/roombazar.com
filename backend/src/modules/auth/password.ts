import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

/*
  promisify drops the options overload, so scrypt is wrapped by hand. Without
  the options the cost parameters would silently fall back to Node's defaults,
  which are far weaker than what is set below.
*/
function scrypt(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

/*
  scrypt from Node's standard library rather than argon2 or bcrypt.

  Both of those are native modules, which on Windows means a compiler toolchain
  and a class of install failures that has nothing to do with this product.
  scrypt is memory-hard, ships with the runtime, and at these parameters is a
  sound choice for password storage.
*/
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;

export const MIN_LENGTH = 6;

/*
  scrypt needs roughly 128 * N * r bytes, which at these parameters is exactly
  32MB — precisely Node's default ceiling, so the call fails with "memory limit
  exceeded". Raising the ceiling rather than lowering the cost: the work factor
  is the entire point of choosing scrypt.
*/
const MAX_MEMORY = 128 * COST * BLOCK_SIZE * 2;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);

  const derived = await scrypt(plain.normalize("NFKC"), salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: MAX_MEMORY,
  });

  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELISM}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, cost, blockSize, parallelism, saltB64, hashB64] = parts;

  const salt = Buffer.from(saltB64 as string, "base64");
  const expected = Buffer.from(hashB64 as string, "base64");

  const derived = await scrypt(plain.normalize("NFKC"), salt, expected.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelism),
    // Derived from the stored parameters, so an older hash with different
    // settings still verifies after the cost factor is raised.
    maxmem: 128 * Number(cost) * Number(blockSize) * 2,
  });

  // Constant time: a fast rejection on the first differing byte would leak how
  // much of a guess was correct.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/**
 * Minimum six characters, and nothing else.
 *
 * Length carries far more strength than character-class requirements, and
 * complexity rules mostly produce Password1! and a sticky note. The only other
 * rejection is a password made of one repeated character, which is a typo more
 * often than a choice.
 */
export function passwordProblem(plain: string): string | null {
  if (plain.length < MIN_LENGTH) {
    return `Use at least ${MIN_LENGTH} characters.`;
  }

  if (plain.length > 200) return "That password is too long.";

  if (/^(.)\1+$/.test(plain)) return "That password is too simple.";

  return null;
}
