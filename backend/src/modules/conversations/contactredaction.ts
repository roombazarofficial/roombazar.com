const MASK = "[contact hidden]";

const PHONE = /(?:\+?\d[\s.\-()]*){9,}/g;

const EMAIL = /[\w.+-]+\s*(?:@|\[at\]|\(at\))\s*[\w.-]+\s*\.\s*[a-z]{2,}/gi;

const HANDLE =
  /\b(?:whats\s*app|wa\.me|telegram|t\.me|insta(?:gram)?|snap(?:chat)?|signal)\b[\s:@-]*[\w.]*/gi;

const SPELLED_DIGITS =
  /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|oh|double)\b(?:[\s,.-]*\b(?:zero|one|two|three|four|five|six|seven|eight|nine|oh|double)\b){5,}/gi;

export interface RedactionResult {
  redactedBody: string | null;
  redacted: boolean;
  matched: string[];
}

export function redactContactDetails(body: string): RedactionResult {
  const matched: string[] = [];
  let output = body;

  const rules: [string, RegExp][] = [
    ["email", EMAIL],
    ["handle", HANDLE],
    ["spelleddigits", SPELLED_DIGITS],
    ["phone", PHONE],
  ];

  for (const [name, pattern] of rules) {
    const regex = new RegExp(pattern.source, pattern.flags);

    if (regex.test(output)) {
      matched.push(name);
      output = output.replace(
        new RegExp(pattern.source, pattern.flags),
        MASK,
      );
    }
  }

  if (matched.length === 0) {
    return { redactedBody: null, redacted: false, matched: [] };
  }

  const collapsed = output.replace(
    new RegExp(`(?:${escapeRegex(MASK)}[\\s,]*){2,}`, "g"),
    `${MASK} `,
  );

  return {
    redactedBody: collapsed.trim(),
    redacted: true,
    matched,
  };
}

const ADVANCE_PAYMENT =
  /\b(?:advance|token|booking\s*(?:amount|fee)|upi|gpay|google\s*pay|phonepe|paytm|bank\s*transfer|imps|neft)\b/gi;

export function looksLikeAdvanceRequest(body: string): boolean {
  const asksForMoney = new RegExp(ADVANCE_PAYMENT.source, ADVANCE_PAYMENT.flags);
  const refusesVisit =
    /\b(?:out\s*of\s*(?:station|town)|travelling|traveling|cannot\s*meet|can'?t\s*meet|no\s*visit)\b/i;

  return asksForMoney.test(body) || refusesVisit.test(body);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
