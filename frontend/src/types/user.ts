/**
 * Trust level drives rate limits, ranking, and whether a listing skips
 * pre-moderation. See docs/03-trust-and-safety.md.
 */
export type TrustLevel = "new" | "verified" | "trusted" | "restricted";

export type UserRole = "user" | "moderator" | "admin";

export type VerificationKind = "phone" | "email" | "governmentid" | "ownership";

/**
 * What any other user may see. Note what is absent: no phone, no email, no
 * rating. Phone appears only through a mutual contact reveal inside a
 * conversation, never on a profile.
 */
export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  trustLevel: TrustLevel;
  verifications: VerificationKind[];
  /** Shown as "Joined 2 days ago" — a visibly new account is a useful signal
   *  to a seeker weighing up a listing. */
  joinedAt: string;
  /** Null until enough conversations exist to be meaningful. */
  typicalReplyHours: number | null;
  activeListingCount: number;
}

/** The signed-in user's own record. Adds the private fields. */
export interface CurrentUser extends PublicUser {
  phone: string;
  phoneVerifiedAt: string | null;
  email: string | null;
  emailVerifiedAt: string | null;
  role: UserRole;
  unreadMessageCount: number;
  unreadNotificationCount: number;
}
