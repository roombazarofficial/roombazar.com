import { cn } from "@/lib/utils/classnames";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("rounded-control skeleton-shimmer", className)}
      {...props}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      {/* Image — matches new 16:11 aspect ratio */}
      <Skeleton className="aspect-[16/11] rounded-none" />
      <div className="space-y-2.5 p-3.5">
        {/* Price */}
        <Skeleton className="h-6 w-24" />
        {/* Furnishing */}
        <Skeleton className="h-3.5 w-20" />
        {/* Title */}
        <Skeleton className="h-4 w-full" />
        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2.5">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
