/**
 * One thread per seeker per listing. The uniqueness of that pair is what
 * stops a seeker opening ten threads to spam one lister.
 */
export interface Conversation {
  id: string;
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  listingRentPaise: number;

  counterpartId: string;
  counterpartName: string;

  /** Both must be non-null before either party sees a phone number. */
  youRevealedAt: string | null;
  theyRevealedAt: string | null;
  /** Sent by the server only when both reveal timestamps are set. */
  counterpartPhone: string | null;

  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  status: "active" | "archived" | "blocked";
}
