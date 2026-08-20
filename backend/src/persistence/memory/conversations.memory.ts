import { Injectable } from "@nestjs/common";
import { NotFound } from "src/common/errors/domain.errors";
import type { Conversation, Message } from "src/domain/conversation.entity";
import type { ConversationsRepository } from "src/persistence/ports/conversations.repository";

@Injectable()
export class MemoryConversationsRepository implements ConversationsRepository {
  private readonly conversations = new Map<string, Conversation>();
  private readonly messages = new Map<string, Message[]>();

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) ?? null;
  }

  async findByListingAndSeeker(
    listingId: string,
    seekerId: string,
  ): Promise<Conversation | null> {
    for (const conversation of this.conversations.values()) {
      if (
        conversation.listingId === listingId &&
        conversation.seekerId === seekerId
      ) {
        return conversation;
      }
    }
    return null;
  }

  async findForUser(userId: string): Promise<Conversation[]> {
    return [...this.conversations.values()]
      .filter(
        (conversation) =>
          conversation.seekerId === userId || conversation.listerId === userId,
      )
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime(),
      );
  }

  async create(conversation: Conversation): Promise<Conversation> {
    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);
    return conversation;
  }

  async update(id: string, patch: Partial<Conversation>): Promise<Conversation> {
    const existing = this.conversations.get(id);
    if (!existing) throw new NotFound("Conversation");

    const updated = { ...existing, ...patch };
    this.conversations.set(id, updated);
    return updated;
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    return [...(this.messages.get(conversationId) ?? [])].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  async addMessage(message: Message): Promise<Message> {
    const thread = this.messages.get(message.conversationId) ?? [];
    thread.push(message);
    this.messages.set(message.conversationId, thread);

    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      this.conversations.set(conversation.id, {
        ...conversation,
        lastMessageAt: message.createdAt,
      });
    }

    return message;
  }

  async markRead(conversationId: string, readerId: string): Promise<void> {
    const thread = this.messages.get(conversationId);
    if (!thread) return;

    const now = new Date().toISOString();

    this.messages.set(
      conversationId,
      thread.map((message) =>
        message.senderId !== readerId && message.readAt === null
          ? { ...message, readAt: now }
          : message,
      ),
    );
  }

  async countThreadsStartedSince(
    seekerId: string,
    since: string,
  ): Promise<number> {
    return [...this.conversations.values()].filter(
      (conversation) =>
        conversation.seekerId === seekerId && conversation.createdAt >= since,
    ).length;
  }

  async countMessagesSince(senderId: string, since: string): Promise<number> {
    let count = 0;

    for (const thread of this.messages.values()) {
      for (const message of thread) {
        if (message.senderId === senderId && message.createdAt >= since) {
          count += 1;
        }
      }
    }

    return count;
  }

  async medianReplyHours(userId: string): Promise<number | null> {
    const gaps: number[] = [];

    for (const conversation of this.conversations.values()) {
      if (
        conversation.seekerId !== userId &&
        conversation.listerId !== userId
      ) {
        continue;
      }

      const thread = await this.listMessages(conversation.id);

      let pendingInboundAt: string | null = null;

      for (const message of thread) {
        if (message.senderId !== userId) {
          pendingInboundAt ??= message.createdAt;
          continue;
        }

        if (pendingInboundAt) {
          const hours =
            (new Date(message.createdAt).getTime() -
              new Date(pendingInboundAt).getTime()) /
            3_600_000;

          if (hours >= 0) gaps.push(hours);
          pendingInboundAt = null;
        }
      }
    }

    if (gaps.length < 3) return null;

    gaps.sort((a, b) => a - b);
    const middle = Math.floor(gaps.length / 2);

    const median =
      gaps.length % 2 === 0
        ? ((gaps[middle - 1] as number) + (gaps[middle] as number)) / 2
        : (gaps[middle] as number);

    return Math.max(1, Math.round(median));
  }
}
