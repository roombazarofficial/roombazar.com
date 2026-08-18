export interface Conversation {
  id: string;
  listingId: string;
  seekerId: string;
  listerId: string;

  seekerRevealedAt: string | null;
  listerRevealedAt: string | null;

  lastMessageAt: string;
  status: "active" | "archivedbyseeker" | "archivedbylister" | "blocked";
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;

  body: string;
  redactedBody: string | null;

  readAt: string | null;
  hiddenAt: string | null;
  createdAt: string;
}
