import type { TrustLevel, User } from "src/domain/user.entity";

export interface TrustSignals {
  upheldReportCount: number;
  listingsMarkedTaken: number;
  listingsExpiredUnattended: number;
  medianReplyHours: number | null;
}

const TRUSTED_MIN_ACCOUNT_AGE_DAYS = 30;
const TRUSTED_MIN_CLOSED_LISTINGS = 2;
const TRUSTED_MAX_REPLY_HOURS = 24;

export function earnedTrustLevel(
  user: User,
  signals: TrustSignals,
  now: Date = new Date(),
): TrustLevel {
  if (user.trustLevel === "restricted") return "restricted";

  if (signals.upheldReportCount > 0) {
    return user.verifications.includes("governmentid") ? "verified" : "new";
  }

  const verified = user.verifications.includes("governmentid");
  if (!verified) return "new";

  const ageDays =
    (now.getTime() - new Date(user.createdAt).getTime()) / 86_400_000;

  const closedProperly = signals.listingsMarkedTaken >= TRUSTED_MIN_CLOSED_LISTINGS;

  const tidier = signals.listingsMarkedTaken > signals.listingsExpiredUnattended;

  const responsive =
    signals.medianReplyHours !== null &&
    signals.medianReplyHours <= TRUSTED_MAX_REPLY_HOURS;

  const trusted =
    ageDays >= TRUSTED_MIN_ACCOUNT_AGE_DAYS &&
    closedProperly &&
    tidier &&
    responsive;

  return trusted ? "trusted" : "verified";
}

export function needsTrustUpdate(
  user: User,
  signals: TrustSignals,
  now: Date = new Date(),
): boolean {
  return earnedTrustLevel(user, signals, now) !== user.trustLevel;
}
