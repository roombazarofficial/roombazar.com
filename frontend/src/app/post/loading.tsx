/*
  Shown while the next wizard step loads.

  Without it a click on Continue produces no visible change until the step is
  ready, which reads as a dead button — in development the route is compiled on
  demand, and on a slow connection the payload takes just as long.
*/
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-2/5 animate-pulse rounded-control bg-surface-sunken" />
        <div className="h-4 w-3/4 animate-pulse rounded-control bg-surface-sunken" />
      </div>

      <div className="space-y-4">
        <div className="h-11 animate-pulse rounded-control bg-surface-sunken" />
        <div className="h-11 animate-pulse rounded-control bg-surface-sunken" />
        <div className="h-24 animate-pulse rounded-card bg-surface-sunken" />
      </div>

      <span className="sr-only" role="status">
        Loading the next step
      </span>
    </div>
  );
}
