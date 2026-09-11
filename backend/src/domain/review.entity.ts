export interface PropertyReview {
  id: string;
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

  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  count: number;
  average: number;
  /** Count of reviews at each star rating, keyed 1-5. */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
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

export interface PlatformFeedback {
  id: string;
  userId: string | null;
  sentiment: FeedbackSentiment;
  category: FeedbackCategory | null;
  message: string | null;
  createdAt: string;
}
