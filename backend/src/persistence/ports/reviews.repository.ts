import type {
  PlatformFeedback,
  FeedbackCategory,
  FeedbackSentiment,
  PropertyReview,
  ReviewSummary,
} from "src/domain/review.entity";

export const REVIEWS_REPOSITORY = Symbol("REVIEWS_REPOSITORY");

export type ReviewSort = "relevant" | "newest" | "highest" | "lowest";

export interface UpsertReviewInput {
  listingId: string;
  userId: string;
  overallRating: number;
  cleanliness: number | null;
  locationScore: number | null;
  valueForMoney: number | null;
  accuracy: number | null;
  hostBehavior: number | null;
  body: string;
  photos: string[];
}

export interface CreateFeedbackInput {
  userId: string | null;
  sentiment: FeedbackSentiment;
  category: FeedbackCategory | null;
  message: string | null;
}

export interface ReviewsRepository {
  listForListing(listingId: string, sort: ReviewSort): Promise<PropertyReview[]>;
  summaryForListing(listingId: string): Promise<ReviewSummary>;
  findByUserAndListing(
    userId: string,
    listingId: string,
  ): Promise<PropertyReview | null>;
  listByUser(userId: string): Promise<PropertyReview[]>;
  upsert(input: UpsertReviewInput): Promise<PropertyReview>;

  createFeedback(input: CreateFeedbackInput): Promise<PlatformFeedback>;
}
