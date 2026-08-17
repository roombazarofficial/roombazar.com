import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";
import { mockListings } from "./mockdata";

const seeker = { id: "user-9", name: "Rahul Nair" };

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    listingId: mockListings[0]!.id,
    listingSlug: mockListings[0]!.slug,
    listingTitle: mockListings[0]!.title,
    listingRentPaise: mockListings[0]!.rentPaise,
    counterpartId: seeker.id,
    counterpartName: seeker.name,
    youRevealedAt: null,
    theyRevealedAt: null,
    counterpartPhone: null,
    lastMessagePreview: "Is the room still available for the 1st?",
    lastMessageAt: "2026-08-16T06:20:00Z",
    unreadCount: 2,
    status: "active",
  },
  {
    id: "conv-2",
    listingId: mockListings[1]!.id,
    listingSlug: mockListings[1]!.slug,
    listingTitle: mockListings[1]!.title,
    listingRentPaise: mockListings[1]!.rentPaise,
    counterpartId: "user-10",
    counterpartName: "Meera Iyer",
    youRevealedAt: "2026-08-15T10:00:00Z",
    theyRevealedAt: "2026-08-15T10:30:00Z",
    counterpartPhone: "9845012345",
    lastMessagePreview: "Perfect, see you Saturday at 11.",
    lastMessageAt: "2026-08-15T11:02:00Z",
    unreadCount: 0,
    status: "active",
  },
];

export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: seeker.id,
      body: "Hi, is this room still available from the 1st of next month?",
      redacted: false,
      sentAt: "2026-08-16T06:15:00Z",
      readAt: null,
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: seeker.id,
      // Demonstrates the pre-reveal filter: the number the seeker typed is
      // masked for display and kept intact server-side for moderation.
      body: "You can reach me on [number hidden] if that is easier",
      redacted: true,
      sentAt: "2026-08-16T06:20:00Z",
      readAt: null,
    },
  ],
  "conv-2": [
    {
      id: "msg-3",
      conversationId: "conv-2",
      senderId: "user-10",
      body: "Could I visit this weekend?",
      redacted: false,
      sentAt: "2026-08-15T09:40:00Z",
      readAt: "2026-08-15T09:55:00Z",
    },
    {
      id: "msg-4",
      conversationId: "conv-2",
      senderId: "me",
      body: "Yes, Saturday morning works. Shall we say 11?",
      redacted: false,
      sentAt: "2026-08-15T09:58:00Z",
      readAt: "2026-08-15T10:20:00Z",
    },
    {
      id: "msg-5",
      conversationId: "conv-2",
      senderId: "user-10",
      body: "Perfect, see you Saturday at 11.",
      redacted: false,
      sentAt: "2026-08-15T11:02:00Z",
      readAt: "2026-08-15T11:10:00Z",
    },
  ],
};
