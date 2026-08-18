import {
  assertTransition,
  canTransition,
  expiryFrom,
  missingRequiredFields,
  requiresReconfirmation,
} from "./listinglifecycle";
import { InvalidTransition } from "src/common/errors/domain.errors";

describe("listing lifecycle", () => {
  it("publishes a draft", () => {
    expect(canTransition("draft", "active")).toBe(true);
  });

  it("allows the transition that matters most: active to taken", () => {
    expect(canTransition("active", "taken")).toBe(true);
  });

  it("lets a taken room reopen when a tenant falls through", () => {
    expect(canTransition("taken", "active")).toBe(true);
  });

  it("lets an expired listing be renewed", () => {
    expect(canTransition("expired", "active")).toBe(true);
  });

  it("makes suspended terminal from the owner side", () => {
    expect(canTransition("suspended", "active")).toBe(false);
    expect(canTransition("suspended", "taken")).toBe(false);
  });

  it("refuses to publish straight into taken", () => {
    expect(canTransition("draft", "taken")).toBe(false);
  });

  it("throws InvalidTransition rather than failing silently", () => {
    expect(() => assertTransition("suspended", "active")).toThrow(
      InvalidTransition,
    );
    expect(() => assertTransition("active", "taken")).not.toThrow();
  });

  describe("expiry", () => {
    it("is 30 days after publishing", () => {
      const published = new Date("2026-08-01T00:00:00.000Z");
      expect(expiryFrom(published)).toBe("2026-08-31T00:00:00.000Z");
    });

    it("does not mutate the date it is given", () => {
      const published = new Date("2026-08-01T00:00:00.000Z");
      expiryFrom(published);
      expect(published.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    });
  });

  describe("reconfirmation", () => {
    it("is required when reviving a stale listing", () => {
      expect(requiresReconfirmation("expired")).toBe(true);
      expect(requiresReconfirmation("taken")).toBe(true);
    });

    it("is not required to resume a paused one", () => {
      expect(requiresReconfirmation("paused")).toBe(false);
    });
  });

  describe("required fields", () => {
    const complete = {
      roomType: "singleroom" as const,
      postedBy: "owner" as const,
      localityId: "loc-1",
      rentPaise: 1_400_000,
      photos: [{ id: "p1" }],
    };

    it("accepts exactly the five that gate publishing", () => {
      expect(missingRequiredFields(complete as never)).toEqual([]);
    });

    it("names what is missing", () => {
      expect(missingRequiredFields({})).toEqual([
        "roomType",
        "postedBy",
        "localityId",
        "rentPaise",
        "photos",
      ]);
    });

    it("treats an empty photo array as missing", () => {
      expect(
        missingRequiredFields({ ...complete, photos: [] } as never),
      ).toEqual(["photos"]);
    });

    it("does not require a description, area or amenities", () => {
      expect(missingRequiredFields(complete as never)).not.toContain(
        "description",
      );
    });
  });
});
