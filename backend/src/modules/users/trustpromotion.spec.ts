import { earnedTrustLevel, needsTrustUpdate, type TrustSignals } from "./trustpromotion";
import type { User } from "src/domain/user.entity";

const NOW = new Date("2026-08-17T00:00:00.000Z");

function user(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "priya@example.com",
    emailVerifiedAt: "2026-01-01T00:00:00.000Z",
    passwordHash: "scrypt$x",
    phone: "9876543210",
    phoneVerifiedAt: "2026-01-01T00:00:00.000Z",
    name: "Priya",
    avatarUrl: null,
    role: "user",
    trustLevel: "new",
    verifications: ["email"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}

const clean: TrustSignals = {
  upheldReportCount: 0,
  listingsMarkedTaken: 3,
  listingsExpiredUnattended: 0,
  medianReplyHours: 4,
};

describe("earnedTrustLevel", () => {
  it("keeps an unverified account at new, however well behaved", () => {
    expect(earnedTrustLevel(user(), clean, NOW)).toBe("new");
  });

  it("promotes to verified once government ID is confirmed", () => {
    const verified = user({ verifications: ["email", "governmentid"] });
    expect(earnedTrustLevel(verified, { ...clean, medianReplyHours: null }, NOW)).toBe(
      "verified",
    );
  });

  it("promotes to trusted on a good record", () => {
    const verified = user({ verifications: ["email", "governmentid"] });
    expect(earnedTrustLevel(verified, clean, NOW)).toBe("trusted");
  });

  describe("what blocks trusted", () => {
    const verified = user({ verifications: ["email", "governmentid"] });

    it("an account younger than 30 days", () => {
      const fresh = user({
        verifications: ["email", "governmentid"],
        createdAt: "2026-08-10T00:00:00.000Z",
      });

      expect(earnedTrustLevel(fresh, clean, NOW)).toBe("verified");
    });

    it("never having closed a listing properly", () => {
      expect(
        earnedTrustLevel(verified, { ...clean, listingsMarkedTaken: 0 }, NOW),
      ).toBe("verified");
    });

    it("letting more listings lapse than were closed", () => {
      expect(
        earnedTrustLevel(
          verified,
          { ...clean, listingsMarkedTaken: 2, listingsExpiredUnattended: 5 },
          NOW,
        ),
      ).toBe("verified");
    });

    it("replying too slowly", () => {
      expect(
        earnedTrustLevel(verified, { ...clean, medianReplyHours: 72 }, NOW),
      ).toBe("verified");
    });

    it("not enough reply history to judge", () => {
      expect(
        earnedTrustLevel(verified, { ...clean, medianReplyHours: null }, NOW),
      ).toBe("verified");
    });
  });

  describe("upheld reports", () => {
    it("demote a trusted account back to verified", () => {
      const trusted = user({
        verifications: ["email", "governmentid"],
        trustLevel: "trusted",
      });

      expect(
        earnedTrustLevel(trusted, { ...clean, upheldReportCount: 1 }, NOW),
      ).toBe("verified");
    });

    it("hold an unverified account at new", () => {
      expect(
        earnedTrustLevel(user(), { ...clean, upheldReportCount: 2 }, NOW),
      ).toBe("new");
    });
  });

  it("never lifts a restriction automatically", () => {
    const restricted = user({
      trustLevel: "restricted",
      verifications: ["email", "governmentid"],
    });

    expect(earnedTrustLevel(restricted, clean, NOW)).toBe("restricted");
  });
});

describe("needsTrustUpdate", () => {
  it("is false when the stored level is already correct", () => {
    const trusted = user({
      verifications: ["email", "governmentid"],
      trustLevel: "trusted",
    });

    expect(needsTrustUpdate(trusted, clean, NOW)).toBe(false);
  });

  it("is true when an account has earned a promotion", () => {
    const verified = user({
      verifications: ["email", "governmentid"],
      trustLevel: "verified",
    });

    expect(needsTrustUpdate(verified, clean, NOW)).toBe(true);
  });
});
