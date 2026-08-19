export interface Message {
  id: string;
  conversationId: string;
  /** "me" for the signed-in user, otherwise the counterpart's id. */
  senderId: string;
  /** Display text. Contact details are already masked before reveal. */
  body: string;
  /** True when the filter removed a phone number, email or handle. */
  redacted: boolean;
  sentAt: string;
  readAt: string | null;
}
