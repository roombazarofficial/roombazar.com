import type { Conversation, Message } from "src/domain/conversation.entity";
import type { Listing } from "src/domain/listing.entity";
import type { User } from "src/domain/user.entity";

export interface MessageView {
  id: string;
  conversationId: string;
  senderId: string;
  publicBody: string;
  redacted: boolean;
  sentAt: string;
  readAt: string | null;
}

export function presentMessage(
  message: Message,
  viewerId: string,
  bothRevealed: boolean,
): MessageView {
  const showOriginal = message.senderId === viewerId || bothRevealed;
  const masked = message.redactedBody !== null;

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    publicBody:
      showOriginal || !masked ? message.body : (message.redactedBody as string),
    redacted: masked && !bothRevealed,
    sentAt: message.createdAt,
    readAt: message.readAt,
  };
}

export function presentConversation(
  conversation: Conversation,
  viewer: User,
  counterpart: User,
  listing: Listing,
  lastMessagePreview: string,
  unreadCount: number,
  counterpartPhone: string | null,
): Record<string, unknown> {
  const isSeeker = conversation.seekerId === viewer.id;

  return {
    id: conversation.id,
    listingId: listing.id,
    listingSlug: listing.slug,
    listingTitle: listing.title,
    listingRentPaise: listing.rentPaise,

    counterpartId: counterpart.id,
    counterpartName: counterpart.name,

    youRevealedAt: isSeeker
      ? conversation.seekerRevealedAt
      : conversation.listerRevealedAt,
    theyRevealedAt: isSeeker
      ? conversation.listerRevealedAt
      : conversation.seekerRevealedAt,

    publicCounterpartPhone: counterpartPhone,

    lastMessagePreview,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    status: conversation.status,
  };
}
