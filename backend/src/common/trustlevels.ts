import type { TrustLevel } from "src/domain/user.entity";

export interface TrustPolicy {
  maxActiveListings: number;
  maxMessagesPerDay: number;
  maxNewThreadsPerDay: number;
  maxReportsPerDay: number;
  skipsPreModeration: boolean;
  rankingWeight: number;
}

export const trustPolicies: Record<TrustLevel, TrustPolicy> = {
  new: {
    maxActiveListings: 2,
    maxMessagesPerDay: 10,
    maxNewThreadsPerDay: 5,
    maxReportsPerDay: 5,
    skipsPreModeration: false,
    rankingWeight: 0.8,
  },
  verified: {
    maxActiveListings: 5,
    maxMessagesPerDay: 50,
    maxNewThreadsPerDay: 20,
    maxReportsPerDay: 20,
    skipsPreModeration: false,
    rankingWeight: 1.1,
  },
  trusted: {
    maxActiveListings: 25,
    maxMessagesPerDay: 200,
    maxNewThreadsPerDay: 60,
    maxReportsPerDay: 50,
    skipsPreModeration: true,
    rankingWeight: 1.3,
  },
  restricted: {
    maxActiveListings: 0,
    maxMessagesPerDay: 0,
    maxNewThreadsPerDay: 0,
    maxReportsPerDay: 0,
    skipsPreModeration: false,
    rankingWeight: 0,
  },
};

export function policyFor(level: TrustLevel): TrustPolicy {
  return trustPolicies[level];
}
