import type { Conversation, Message } from "src/domain/conversation.entity";

export const CONVERSATIONS_REPOSITORY = Symbol("CONVERSATIONS_REPOSITORY");

export interface ConversationsRepository {
  findById(id: string): Promise<Conversation | null>;
  findByListingAndSeeker(
    listingId: string,
    seekerId: string,
  ): Promise<Conversation | null>;
  findForUser(userId: string): Promise<Conversation[]>;

  create(conversation: Conversation): Promise<Conversation>;
  update(id: string, patch: Partial<Conversation>): Promise<Conversation>;

  listMessages(conversationId: string): Promise<Message[]>;
  addMessage(message: Message): Promise<Message>;
  markRead(conversationId: string, readerId: string): Promise<void>;

  countThreadsStartedSince(seekerId: string, since: string): Promise<number>;

  countMessagesSince(senderId: string, since: string): Promise<number>;

  medianReplyHours(userId: string): Promise<number | null>;
}
