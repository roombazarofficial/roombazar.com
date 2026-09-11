export interface ReviewAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface PropertyReview {
  id: string;
  overallRating: number;
  cleanliness: number | null;
  locationScore: number | null;
  valueForMoney: number | null;
  accuracy: number | null;
  hostBehavior: number | null;
  body: string;
  photos: string[];
  createdAt: string;
  author: ReviewAuthor;
}

export interface ReviewSummary {
  count: number;
  average: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface ReviewListResponse {
  summary: ReviewSummary;
  items: PropertyReview[];
}

export type ReviewSort = "relevant" | "newest" | "highest" | "lowest";

export interface SubmitReviewInput {
  overallRating: number;
  cleanliness: number | null;
  locationScore: number | null;
  valueForMoney: number | null;
  accuracy: number | null;
  hostBehavior: number | null;
  body: string;
  photos?: string[];
}

export type FeedbackSentiment =
  | "loved"
  | "good"
  | "okay"
  | "couldbebetter"
  | "notsatisfied";

export type FeedbackCategory =
  | "search"
  | "listings"
  | "propertyinfo"
  | "contactingowner"
  | "bookinginquiry"
  | "websiteexperience"
  | "other";

export interface SubmitFeedbackInput {
  sentiment: FeedbackSentiment;
  category: FeedbackCategory | null;
  message: string | null;
}
