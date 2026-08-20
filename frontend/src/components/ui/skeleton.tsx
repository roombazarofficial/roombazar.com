import { cn } from "@/lib/utils/classnames";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-control bg-surface-sunken",
        className,
      )}
      {...props}
    />

  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

    </div>

  );
}
