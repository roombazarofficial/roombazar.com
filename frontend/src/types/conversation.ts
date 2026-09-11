export interface Conversation {
  id: string;
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  listingRentPaise: number;

  counterpartId: string;
  counterpartName: string;

  youRevealedAt: string | null;
  theyRevealedAt: string | null;
  counterpartPhone: string | null;

  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  status: "active" | "archivedbyseeker" | "archivedbylister" | "blocked";
  /**
   * Seeker-facing inquiry progress. Non-null only when the current user is
   * the seeker in this conversation — the lister sees null since it doesn't
   * apply to them.
   */
  inquiryStatus: "sent" | "viewed" | "responded" | null;
}
