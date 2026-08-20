export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  redacted: boolean;
  sentAt: string;
  readAt: string | null;
}
