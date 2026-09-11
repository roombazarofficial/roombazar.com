import { serverTryGet } from "./serverclient";

export interface MyReview {
  id: string;
  listingId: string;
  listingSlug: string | null;
  listingTitle: string;
  overallRating: number;
  body: string;
  createdAt: string;
}

export function fetchMyReviews(): Promise<MyReview[]> {
  return serverTryGet<MyReview[]>("/me/reviews", []);
}
