"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/emptystate";
import { Skeleton } from "@/components/ui/skeleton";
import { StarDisplay } from "./starrating";
import { ReviewCard } from "./reviewcard";
import { ReviewForm } from "./reviewform";
import { fetchListingReviews, fetchMyReview } from "@/lib/api/reviews.client";
import { useAuthUi } from "@/store/authuistore";
import type { PropertyReview, ReviewListResponse, ReviewSort } from "@/types/review";

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export function ReviewsSection({
  listingId,
  listingTitle,
}: {
  listingId: string;
  listingTitle: string;
}) {
  const user = useAuthUi((state) => state.user);
  const openSignIn = useAuthUi((state) => state.openSignIn);

  const [sort, setSort] = useState<ReviewSort>("relevant");
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<PropertyReview | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function load(currentSort: ReviewSort) {
    setLoading(true);
    try {
      const result = await fetchListingReviews(listingId, currentSort);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  useEffect(() => {
    if (!user) {
      setMyReview(null);
      return;
    }
    fetchMyReview(listingId)
      .then(setMyReview)
      .catch(() => setMyReview(null));
  }, [listingId, user]);

  function handleWriteReview() {
    if (!user) {
      openSignIn({
        intent: `Sign in to review "${listingTitle}".`,
        next: window.location.pathname,
      });
      return;
    }
    setFormOpen(true);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const summary = data?.summary;
  const items = data?.items ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Reviews & ratings</h2>
          {summary && summary.count > 0 ? (
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-2xl font-bold text-ink">
                {summary.average.toFixed(1)}
              </span>
              <StarDisplay value={summary.average} size="md" />
              <span className="text-sm text-ink-muted">
                Based on {summary.count} review{summary.count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-ink-muted">No reviews yet — be the first.</p>
          )}
        </div>

        <Button size="sm" variant="secondary" onClick={handleWriteReview}>
          {myReview ? "Update your review" : "Write a review"}
        </Button>
      </div>

      {summary && summary.count > 0 && (
        <div className="mt-4 max-w-xs space-y-1">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.distribution[String(star) as "1" | "2" | "3" | "4" | "5"] ?? 0;
            const pct = summary.count ? Math.round((count / summary.count) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="w-8 shrink-0">{star} ★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 ? (
        <>
          <div className="mt-6 flex justify-end">
            <div className="w-44">
              <Select
                options={SORT_OPTIONS}
                value={sort}
                onChange={(e) => setSort(e.target.value as ReviewSort)}
                aria-label="Sort reviews"
              />
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {items.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          className="mt-6"
          title="No reviews yet"
          description="Once seekers visit and rent this place, their reviews will show up here."
        />
      )}

      <ReviewForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        listingId={listingId}
        listingTitle={listingTitle}
        existing={myReview}
        onSubmitted={() => {
          setMyReview(null);
          fetchMyReview(listingId).then(setMyReview).catch(() => {});
          void load(sort);
        }}
      />
    </div>
  );
}
