import { api } from "./client";
import type {
  PropertyReview,
  ReviewListResponse,
  ReviewSort,
  SubmitFeedbackInput,
  SubmitReviewInput,
} from "@/types/review";

export function fetchListingReviews(
  listingId: string,
  sort: ReviewSort = "relevant",
): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>(
    `/listings/${listingId}/reviews?sort=${sort}`,
  );
}

export function fetchMyReview(
  listingId: string,
): Promise<PropertyReview | null> {
  return api.get<PropertyReview | null>(`/listings/${listingId}/reviews/mine`);
}

export function submitReview(listingId: string, input: SubmitReviewInput) {
  return api.post(`/listings/${listingId}/reviews`, {
    ...input,
    photos: input.photos ?? [],
  });
}

export function submitPlatformFeedback(input: SubmitFeedbackInput) {
  return api.post("/feedback", input);
}
