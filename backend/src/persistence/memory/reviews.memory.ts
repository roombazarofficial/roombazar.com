import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type {
  CreateFeedbackInput,
  ReviewsRepository,
  ReviewSort,
  UpsertReviewInput,
} from "src/persistence/ports/reviews.repository";
import type {
  PlatformFeedback,
  PropertyReview,
  ReviewSummary,
} from "src/domain/review.entity";

@Injectable()
export class MemoryReviewsRepository implements ReviewsRepository {
  private readonly reviews = new Map<string, PropertyReview>();
  private readonly feedback: PlatformFeedback[] = [];

  private key(listingId: string, userId: string): string {
    return `${listingId}:${userId}`;
  }

  async listForListing(
    listingId: string,
    sort: ReviewSort,
  ): Promise<PropertyReview[]> {
    const rows = [...this.reviews.values()].filter(
      (r) => r.listingId === listingId,
    );

    if (sort === "highest") rows.sort((a, b) => b.overallRating - a.overallRating);
    else if (sort === "lowest") rows.sort((a, b) => a.overallRating - b.overallRating);
    else rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return rows;
  }

  async summaryForListing(listingId: string): Promise<ReviewSummary> {
    const rows = [...this.reviews.values()].filter(
      (r) => r.listingId === listingId,
    );

    const distribution: ReviewSummary["distribution"] = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let total = 0;
    for (const row of rows) {
      const star = Math.min(5, Math.max(1, Math.round(row.overallRating))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      distribution[star] += 1;
      total += row.overallRating;
    }

    return {
      count: rows.length,
      average: rows.length ? total / rows.length : 0,
      distribution,
    };
  }

  async findByUserAndListing(
    userId: string,
    listingId: string,
  ): Promise<PropertyReview | null> {
    return this.reviews.get(this.key(listingId, userId)) ?? null;
  }

  async listByUser(userId: string): Promise<PropertyReview[]> {
    return [...this.reviews.values()].filter((r) => r.userId === userId);
  }

  async upsert(input: UpsertReviewInput): Promise<PropertyReview> {
    const key = this.key(input.listingId, input.userId);
    const existing = this.reviews.get(key);
    const now = new Date().toISOString();

    const review: PropertyReview = {
      id: existing?.id ?? randomUUID(),
      listingId: input.listingId,
      userId: input.userId,
      overallRating: input.overallRating,
      cleanliness: input.cleanliness,
      locationScore: input.locationScore,
      valueForMoney: input.valueForMoney,
      accuracy: input.accuracy,
      hostBehavior: input.hostBehavior,
      body: input.body,
      photos: input.photos,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.reviews.set(key, review);
    return review;
  }

  async createFeedback(input: CreateFeedbackInput): Promise<PlatformFeedback> {
    const feedback: PlatformFeedback = {
      id: randomUUID(),
      userId: input.userId,
      sentiment: input.sentiment,
      category: input.category,
      message: input.message,
      createdAt: new Date().toISOString(),
    };

    this.feedback.push(feedback);
    return feedback;
  }
}
