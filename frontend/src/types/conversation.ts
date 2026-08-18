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
  status: "active" | "archived" | "blocked";
}
