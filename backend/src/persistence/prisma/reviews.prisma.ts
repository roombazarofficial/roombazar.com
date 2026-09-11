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
import { PrismaService } from "./prisma.service";

type ReviewRow = Awaited<
  ReturnType<PrismaService["propertyReview"]["findFirstOrThrow"]>
>;

function toDomainReview(row: ReviewRow): PropertyReview {
  return {
    id: row.id,
    listingId: row.listingId,
    userId: row.userId,
    overallRating: row.overallRating,
    cleanliness: row.cleanliness,
    locationScore: row.locationScore,
    valueForMoney: row.valueForMoney,
    accuracy: row.accuracy,
    hostBehavior: row.hostBehavior,
    body: row.body,
    photos: row.photos,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type FeedbackRow = Awaited<
  ReturnType<PrismaService["platformFeedback"]["findFirstOrThrow"]>
>;

function toDomainFeedback(row: FeedbackRow): PlatformFeedback {
  return {
    id: row.id,
    userId: row.userId,
    sentiment: row.sentiment,
    category: row.category,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class PrismaReviewsRepository implements ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listForListing(
    listingId: string,
    sort: ReviewSort,
  ): Promise<PropertyReview[]> {
    const orderBy =
      sort === "newest"
        ? { createdAt: "desc" as const }
        : sort === "highest"
          ? { overallRating: "desc" as const }
          : sort === "lowest"
            ? { overallRating: "asc" as const }
            : { createdAt: "desc" as const }; // "relevant" — newest-first for now

    const rows = await this.prisma.propertyReview.findMany({
      where: { listingId },
      orderBy,
    });

    return rows.map(toDomainReview);
  }

  async summaryForListing(listingId: string): Promise<ReviewSummary> {
    const rows = await this.prisma.propertyReview.findMany({
      where: { listingId },
      select: { overallRating: true },
    });

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
    const row = await this.prisma.propertyReview.findUnique({
      where: { listingId_userId: { listingId, userId } },
    });

    return row ? toDomainReview(row) : null;
  }

  async listByUser(userId: string): Promise<PropertyReview[]> {
    const rows = await this.prisma.propertyReview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return rows.map(toDomainReview);
  }

  async upsert(input: UpsertReviewInput): Promise<PropertyReview> {
    const row = await this.prisma.propertyReview.upsert({
      where: {
        listingId_userId: { listingId: input.listingId, userId: input.userId },
      },
      create: {
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
      },
      update: {
        overallRating: input.overallRating,
        cleanliness: input.cleanliness,
        locationScore: input.locationScore,
        valueForMoney: input.valueForMoney,
        accuracy: input.accuracy,
        hostBehavior: input.hostBehavior,
        body: input.body,
        photos: input.photos,
      },
    });

    return toDomainReview(row);
  }

  async createFeedback(input: CreateFeedbackInput): Promise<PlatformFeedback> {
    const row = await this.prisma.platformFeedback.create({
      data: {
        userId: input.userId,
        sentiment: input.sentiment,
        category: input.category,
        message: input.message,
      },
    });

    return toDomainFeedback(row);
  }
}
