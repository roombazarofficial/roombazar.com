import { Injectable } from "@nestjs/common";
import type { Conversation, Message } from "src/domain/conversation.entity";
import type { ConversationsRepository } from "src/persistence/ports/conversations.repository";
import { PrismaService } from "./prisma.service";
import { toDomainConversation, toDomainMessage } from "./mappers";

const REPLY_SAMPLE_THREADS = 40;

@Injectable()
export class PrismaConversationsRepository implements ConversationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findUnique({ where: { id } });
    return row ? toDomainConversation(row) : null;
  }

  async findByListingAndSeeker(
    listingId: string,
    seekerId: string,
  ): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findUnique({
      where: { listingId_seekerId: { listingId, seekerId } },
    });

    return row ? toDomainConversation(row) : null;
  }

  async findForUser(userId: string): Promise<Conversation[]> {
    const rows = await this.prisma.conversation.findMany({
      where: { OR: [{ seekerId: userId }, { listerId: userId }] },
      orderBy: { lastMessageAt: "desc" },
    });

    return rows.map(toDomainConversation);
  }

  async create(conversation: Conversation): Promise<Conversation> {
    const row = await this.prisma.conversation.create({
      data: {
        id: conversation.id,
        listingId: conversation.listingId,
        seekerId: conversation.seekerId,
        listerId: conversation.listerId,
        status: conversation.status,
        lastMessageAt: new Date(conversation.lastMessageAt),
      },
    });

    return toDomainConversation(row);
  }

  async update(id: string, patch: Partial<Conversation>): Promise<Conversation> {
    const row = await this.prisma.conversation.update({
      where: { id },
      data: {
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.seekerRevealedAt !== undefined && {
          seekerRevealedAt: patch.seekerRevealedAt
            ? new Date(patch.seekerRevealedAt)
            : null,
        }),
        ...(patch.listerRevealedAt !== undefined && {
          listerRevealedAt: patch.listerRevealedAt
            ? new Date(patch.listerRevealedAt)
            : null,
        }),
        ...(patch.lastMessageAt !== undefined && {
          lastMessageAt: new Date(patch.lastMessageAt),
        }),
      },
    });

    return toDomainConversation(row);
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map(toDomainMessage);
  }

  async addMessage(message: Message): Promise<Message> {
    const [row] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          body: message.body,
          redactedBody: message.redactedBody,
          createdAt: new Date(message.createdAt),
        },
      }),
      this.prisma.conversation.update({
        where: { id: message.conversationId },
        data: { lastMessageAt: new Date(message.createdAt) },
      }),
    ]);

    return toDomainMessage(row);
  }

  async markRead(conversationId: string, readerId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: readerId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  async countThreadsStartedSince(
    seekerId: string,
    since: string,
  ): Promise<number> {
    return this.prisma.conversation.count({
      where: { seekerId, createdAt: { gte: new Date(since) } },
    });
  }

  async countMessagesSince(senderId: string, since: string): Promise<number> {
    return this.prisma.message.count({
      where: { senderId, createdAt: { gte: new Date(since) } },
    });
  }

  async medianReplyHours(userId: string): Promise<number | null> {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ seekerId: userId }, { listerId: userId }] },
      orderBy: { lastMessageAt: "desc" },
      take: REPLY_SAMPLE_THREADS,
      select: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { senderId: true, createdAt: true },
        },
      },
    });

    const gaps: number[] = [];

    for (const conversation of conversations) {
      let pendingInboundAt: Date | null = null;

      for (const message of conversation.messages) {
        if (message.senderId !== userId) {
          pendingInboundAt ??= message.createdAt;
          continue;
        }

        if (pendingInboundAt) {
          const hours =
            (message.createdAt.getTime() - pendingInboundAt.getTime()) / 3_600_000;

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
