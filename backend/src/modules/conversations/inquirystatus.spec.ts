import { inquiryStatusFor } from "./conversations.service";
import type { Message } from "src/domain/conversation.entity";

const listerId = "lister-1";
const seekerId = "seeker-1";

function message(overrides: Partial<Message>): Message {
  return {
    id: "msg-id",
    conversationId: "conv-id",
    senderId: seekerId,
    body: "hi",
    redactedBody: null,
    readAt: null,
    hiddenAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("inquiryStatusFor", () => {
  it("is 'sent' when the lister hasn't opened or replied", () => {
    const messages = [message({ senderId: seekerId, readAt: null })];

    expect(inquiryStatusFor(messages, listerId)).toBe("sent");
  });

  it("is 'viewed' once the lister has read the seeker's message but not replied", () => {
    const messages = [
      message({ senderId: seekerId, readAt: new Date().toISOString() }),
    ];

    expect(inquiryStatusFor(messages, listerId)).toBe("viewed");
  });

  it("is 'responded' once the lister has sent any message back", () => {
    const messages = [
      message({ senderId: seekerId, readAt: null }),
      message({ senderId: listerId, readAt: null }),
    ];

    expect(inquiryStatusFor(messages, listerId)).toBe("responded");
  });

  it("prefers 'responded' even if the seeker's own message was never marked read", () => {
    // A lister can reply without the read-receipt system marking the
    // original message read (e.g. it was read from a push notification) —
    // a reply is stronger evidence than the read flag either way.
    const messages = [
      message({ senderId: seekerId, readAt: null }),
      message({ senderId: listerId, readAt: null }),
    ];

    expect(inquiryStatusFor(messages, listerId)).toBe("responded");
  });

  it("a lister-only message (no seeker message at all) still counts as 'responded'", () => {
    const messages = [message({ senderId: listerId, readAt: null })];

    expect(inquiryStatusFor(messages, listerId)).toBe("responded");
  });

  it("returns 'sent' for an empty message list", () => {
    expect(inquiryStatusFor([], listerId)).toBe("sent");
  });
});
