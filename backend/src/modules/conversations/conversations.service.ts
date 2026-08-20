import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  CONVERSATIONS_REPOSITORY,
  type ConversationsRepository,
} from "src/persistence/ports/conversations.repository";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  Forbidden,
  NotFound,
  RateLimited,
  TrustLevelTooLow,
  ValidationFailed,
} from "src/common/errors/domain.errors";
import { policyFor } from "src/common/trustlevels";
import type { Conversation, Message } from "src/domain/conversation.entity";
import type { User } from "src/domain/user.entity";
import {
  looksLikeAdvanceRequest,
  redactContactDetails,
} from "./contactredaction";
import { presentMessage, type MessageView } from "./conversations.presenter";

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATIONS_REPOSITORY)
    private readonly conversations: ConversationsRepository,
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  async listForUser(user: User): Promise<Conversation[]> {
    return this.conversations.findForUser(user.id);
  }

  async typicalReplyHours(userId: string): Promise<number | null> {
    return this.conversations.medianReplyHours(userId);
  }

  async getParticipating(id: string, user: User): Promise<Conversation> {
    const conversation = await this.conversations.findById(id);
    if (!conversation) throw new NotFound("Conversation");

    if (conversation.seekerId !== user.id && conversation.listerId !== user.id) {
      throw new NotFound("Conversation");
    }

    return conversation;
  }

  async start(
    listingId: string,
    seeker: User,
    body: string,
  ): Promise<{ conversation: Conversation; message: Message }> {
    const policy = policyFor(seeker.trustLevel);

    if (policy.maxMessagesPerDay === 0) {
      throw new TrustLevelTooLow(
        "Your account cannot send messages at the moment.",
      );
    }

    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt) throw new NotFound("Listing");

    if (listing.status !== "active") {
      throw new ValidationFailed("This room is no longer available");
    }

    if (listing.ownerId === seeker.id) {
      throw new ValidationFailed("This is your own listing");
    }

    const since = dayAgo();

    const threads = await this.conversations.countThreadsStartedSince(
      seeker.id,
      since,
    );

    if (threads >= policy.maxNewThreadsPerDay) {
      throw new RateLimited(
        "You have contacted a lot of rooms today. Try again tomorrow.",
      );
    }

    const existing = await this.conversations.findByListingAndSeeker(
      listingId,
      seeker.id,
    );

    const conversation =
      existing ??
      (await this.conversations.create({
        id: randomUUID(),
        listingId,
        seekerId: seeker.id,
        listerId: listing.ownerId,
        seekerRevealedAt: null,
        listerRevealedAt: null,
        lastMessageAt: new Date().toISOString(),
        status: "active",
        createdAt: new Date().toISOString(),
      }));

    const message = await this.send(conversation.id, seeker, body);

    return { conversation, message };
  }

  async send(
    conversationId: string,
    sender: User,
    body: string,
  ): Promise<Message> {
    const conversation = await this.getParticipating(conversationId, sender);

    if (conversation.status === "blocked") {
      throw new Forbidden("This conversation is closed");
    }

    const trimmed = body.trim();
    if (!trimmed) throw new ValidationFailed("Write a message first");
    if (trimmed.length > 2000) {
      throw new ValidationFailed("That message is too long");
    }

    const policy = policyFor(sender.trustLevel);

    if (policy.maxMessagesPerDay === 0) {
      throw new TrustLevelTooLow(
        "Your account cannot send messages at the moment.",
      );
    }

    const sentToday = await this.conversations.countMessagesSince(
      sender.id,
      dayAgo(),
    );

    if (sentToday >= policy.maxMessagesPerDay) {
      throw new RateLimited(
        "You have sent a lot of messages today. Try again tomorrow.",
      );
    }

    const bothRevealed = Boolean(
      conversation.seekerRevealedAt && conversation.listerRevealedAt,
    );

    const redaction = bothRevealed
      ? { redactedBody: null, redacted: false, matched: [] as string[] }
      : redactContactDetails(trimmed);

    const advanceRequest = looksLikeAdvanceRequest(trimmed);

    const message: Message = {
      id: randomUUID(),
      conversationId,
      senderId: sender.id,
      body: trimmed,
      redactedBody: redaction.redactedBody,
      readAt: null,
      hiddenAt: null,
      createdAt: new Date().toISOString(),
    };

    const stored = await this.conversations.addMessage(message);

    if (advanceRequest || redaction.matched.includes("spelleddigits")) {
    }

    return stored;
  }

  async reveal(conversationId: string, user: User): Promise<Conversation> {
    const conversation = await this.getParticipating(conversationId, user);

    if (conversation.status === "blocked") {
      throw new Forbidden("This conversation is closed");
    }

    const now = new Date().toISOString();

    const isSeeker = conversation.seekerId === user.id;

    if (isSeeker && conversation.seekerRevealedAt) return conversation;
    if (!isSeeker && conversation.listerRevealedAt) return conversation;

    return this.conversations.update(conversationId,
      isSeeker ? { seekerRevealedAt: now } : { listerRevealedAt: now },
    );
  }

  async counterpartPhone(
    conversationId: string,
    user: User,
  ): Promise<string | null> {
    const conversation = await this.getParticipating(conversationId, user);

    if (!conversation.seekerRevealedAt || !conversation.listerRevealedAt) {
      return null;
    }

    const counterpartId =
      conversation.seekerId === user.id
        ? conversation.listerId
        : conversation.seekerId;

    const counterpart = await this.users.findById(counterpartId);
    if (!counterpart || counterpart.deletedAt) return null;

    return counterpart.phone || null;
  }

  async block(conversationId: string, user: User): Promise<Conversation> {
    await this.getParticipating(conversationId, user);

    return this.conversations.update(conversationId, { status: "blocked" });
  }

  async markRead(conversationId: string, user: User): Promise<void> {
    await this.getParticipating(conversationId, user);
    await this.conversations.markRead(conversationId, user.id);
  }

  async messages(
    conversationId: string,
    user: User,
  ): Promise<MessageView[]> {
    const conversation = await this.getParticipating(conversationId, user);
    const all = await this.conversations.listMessages(conversationId);

    const bothRevealed = Boolean(
      conversation.seekerRevealedAt && conversation.listerRevealedAt,
    );

    return all
      .filter((message) => !message.hiddenAt)
      .map((message) => presentMessage(message, user.id, bothRevealed));
  }
}

function dayAgo(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}
