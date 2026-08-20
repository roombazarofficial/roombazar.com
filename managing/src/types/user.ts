export type TrustLevel = "new" | "verified" | "trusted" | "restricted";

export type UserRole = "user" | "moderator" | "admin";

export type VerificationKind = "phone" | "email" | "governmentid" | "ownership";

export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  trustLevel: TrustLevel;
  verifications: VerificationKind[];
  joinedAt: string;
  typicalReplyHours: number | null;
  activeListingCount: number;
}

export interface CurrentUser extends PublicUser {
  phone: string;
  phoneVerifiedAt: string | null;
  email: string | null;
  emailVerifiedAt: string | null;
  role: UserRole;
  unreadMessageCount: number;
  unreadNotificationCount: number;
}
