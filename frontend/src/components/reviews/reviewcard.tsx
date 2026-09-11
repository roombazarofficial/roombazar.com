import { StarDisplay } from "./starrating";
import type { PropertyReview } from "@/types/review";

export function ReviewCard({ review }: { review: PropertyReview }) {
  return (
    <article className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        {review.author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.author.avatarUrl}
            alt={review.author.name}
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {review.author.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-semibold text-ink">{review.author.name}</p>
            <p className="text-xs text-ink-subtle">{formatDate(review.createdAt)}</p>
          </div>
          <StarDisplay value={review.overallRating} size="xs" className="mt-1" />
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
        {review.body}
      </p>

      {review.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {review.photos.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`Photo from ${review.author.name}'s review`}
              className="size-16 shrink-0 rounded-lg border border-line object-cover"
            />
          ))}
        </div>
      )}
    </article>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
