export type TrustLevel = "new" | "verified" | "trusted" | "restricted";
export type UserRole = "user" | "moderator" | "admin";
export type VerificationKind = "phone" | "email" | "governmentid" | "ownership";

export interface User {
  id: string;

  email: string;
  emailVerifiedAt: string | null;

  /** scrypt hash. Never serialised; the interceptor drops it regardless. */
  passwordHash: string;

  /*
    Optional, and collected later rather than at sign-up. Contact reveal shares
    a phone number, so one is required before publishing a listing and before a
    reveal can complete — but not to browse or to create an account.
  */
  phone: string | null;
  phoneVerifiedAt: string | null;

  name: string;
  avatarUrl: string | null;

  role: UserRole;
  trustLevel: TrustLevel;
  verifications: VerificationKind[];

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
