import {
  looksLikeAdvanceRequest,
  redactContactDetails,
} from "./contactredaction";

describe("redactContactDetails", () => {
  it("leaves an ordinary message untouched", () => {
    const result = redactContactDetails(
      "Hi, is this room still free from the 1st? I work nearby.",
    );

    expect(result.redacted).toBe(false);
    expect(result.redactedBody).toBeNull();
    expect(result.matched).toEqual([]);
  });

  describe("phone numbers", () => {
    const cases = [
      ["plain", "call me on 9876543210"],
      ["spaced", "my number is 98765 43210"],
      ["hyphenated", "reach me: 98765-43210"],
      ["country code", "+91 98765 43210 is my number"],
      ["dotted", "9876.543.210"],
      ["bracketed", "(+91) 98765 43210"],
    ] as const;

    it.each(cases)("masks a %s number", (_label, body) => {
      const result = redactContactDetails(body);

      expect(result.redacted).toBe(true);
      expect(result.matched).toContain("phone");
      expect(result.redactedBody).not.toMatch(/\d{5}/);
    });

    it("does not mask a rent figure", () => {
      const result = redactContactDetails("Rent is 15000 and deposit 30000");
      expect(result.redacted).toBe(false);
    });

    it("does not mask a short flat number", () => {
      const result = redactContactDetails("Flat 402, second floor");
      expect(result.redacted).toBe(false);
    });
  });

  describe("emails", () => {
    it("masks a plain address", () => {
      const result = redactContactDetails("write to me at priya@example.com");

      expect(result.matched).toContain("email");
      expect(result.redactedBody).not.toContain("priya@example.com");
    });

    it("masks the [at] evasion", () => {
      const result = redactContactDetails("priya [at] example.com");
      expect(result.redacted).toBe(true);
    });
  });

  describe("off-platform handles", () => {
    it.each([
      "message me on whatsapp",
      "my telegram is @priya",
      "find me on insta priya.r",
      "wa.me/919876543210",
    ])("masks %s", (body) => {
      expect(redactContactDetails(body).redacted).toBe(true);
    });
  });

  describe("deliberate evasion", () => {
    it("masks digits spelled as words", () => {
      const result = redactContactDetails(
        "nine eight seven six five four three two one zero",
      );

      expect(result.matched).toContain("spelleddigits");
    });

    it("leaves ordinary prose containing a number word alone", () => {
      const result = redactContactDetails("There is one bathroom and two beds");
      expect(result.redacted).toBe(false);
    });
  });

  it("collapses adjacent masks so a signature block is not six placeholders", () => {
    const result = redactContactDetails(
      "priya@example.com 9876543210 whatsapp",
    );

    const occurrences = (result.redactedBody ?? "").match(/contact hidden/g);
    expect(occurrences?.length ?? 0).toBeLessThanOrEqual(2);
  });

  it("is not vulnerable to catastrophic backtracking", () => {
    const adversarial = [
      "1".repeat(2000),
      "1 ".repeat(1000),
      "a".repeat(1999) + "!",
      "one ".repeat(500),
      "a.".repeat(1000),
      "1" + ".".repeat(1998) + "1",
    ];

    for (const body of adversarial) {
      const started = process.hrtime.bigint();
      redactContactDetails(body);
      const ms = Number(process.hrtime.bigint() - started) / 1e6;

      expect(ms).toBeLessThan(250);
    }
  });
});

describe("looksLikeAdvanceRequest", () => {
  it.each([
    "please send a token advance to hold it",
    "pay the booking amount on upi",
    "transfer via phonepe and it is yours",
    "I am out of station, cannot meet before",
  ])("flags: %s", (body) => {
    expect(looksLikeAdvanceRequest(body)).toBe(true);
  });

  it.each([
    "rent is 15000, deposit two months",
    "can I visit on Saturday morning?",
  ])("does not flag: %s", (body) => {
    expect(looksLikeAdvanceRequest(body)).toBe(false);
  });
});
