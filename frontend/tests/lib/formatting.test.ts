import { describe, it, expect } from "vitest";
import { formatRupees, formatRupeesCompact } from "../../src/lib/format/rupees";
import { formatAvailability } from "../../src/lib/format/dates";
import { routes } from "../../src/lib/constants/routes";

describe("Formatting helpers", () => {
  it("formats rupees from paise properly", () => {
    expect(formatRupees(1500000)).toBe("₹15,000");
    expect(formatRupees(1200000)).toBe("₹12,000");
    expect(formatRupees(850000)).toBe("₹8,500");
  });

  it("formats compact rupees for cards and badges", () => {
    expect(formatRupeesCompact(1800000)).toBe("₹18K");
    expect(formatRupeesCompact(2200000)).toBe("₹22K");
  });

  it("formats availability string", () => {
    expect(formatAvailability(null)).toBe("Available now");
    expect(formatAvailability("")).toBe("Available now");
  });

  it("constructs type-safe routes", () => {
    expect(routes.city("bengaluru")).toBe("/rooms/bengaluru");
    expect(routes.locality("bengaluru", "koramangala")).toBe("/rooms/bengaluru/koramangala");
    expect(routes.listing("single-room-hsr")).toBe("/room/single-room-hsr");
  });
});
