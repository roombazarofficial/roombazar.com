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
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-2xs">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-3 sm:p-3.5">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-full" />
        <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
