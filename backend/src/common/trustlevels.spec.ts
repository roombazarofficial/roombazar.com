import { policyFor, trustPolicies } from "./trustlevels";
import type { TrustLevel } from "src/domain/user.entity";

const levels: TrustLevel[] = ["new", "verified", "trusted", "restricted"];

describe("trust policies", () => {
  it("defines a policy for every level", () => {
    for (const level of levels) {
      expect(policyFor(level)).toBeDefined();
    }
  });

  it("stops a restricted account creating anything", () => {
    const restricted = policyFor("restricted");

    expect(restricted.maxActiveListings).toBe(0);
    expect(restricted.maxMessagesPerDay).toBe(0);
    expect(restricted.maxNewThreadsPerDay).toBe(0);
    expect(restricted.maxReportsPerDay).toBe(0);
  });

  it("loosens limits as trust increases", () => {
    const earned: TrustLevel[] = ["new", "verified", "trusted"];

    for (let i = 1; i < earned.length; i += 1) {
      const lower = policyFor(earned[i - 1]!);
      const higher = policyFor(earned[i]!);

      expect(higher.maxActiveListings).toBeGreaterThan(lower.maxActiveListings);
      expect(higher.maxMessagesPerDay).toBeGreaterThan(lower.maxMessagesPerDay);
      expect(higher.maxNewThreadsPerDay).toBeGreaterThan(
        lower.maxNewThreadsPerDay,
      );
    }
  });

  it("keeps new accounts restrictive, since that is where abuse comes from", () => {
    expect(policyFor("new").maxActiveListings).toBeLessThanOrEqual(2);
    expect(policyFor("new").maxNewThreadsPerDay).toBeLessThanOrEqual(5);
  });

  it("only lets trusted accounts skip pre-moderation", () => {
    const skipping = levels.filter((level) => policyFor(level).skipsPreModeration);
    expect(skipping).toEqual(["trusted"]);
  });

  it("allows fewer new threads than messages at every level", () => {
    for (const level of levels) {
      const policy = policyFor(level);
      expect(policy.maxNewThreadsPerDay).toBeLessThanOrEqual(
        policy.maxMessagesPerDay,
      );
    }
  });

  it("gives a restricted account zero ranking weight", () => {
    expect(trustPolicies.restricted.rankingWeight).toBe(0);
  });
});
