import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mockListings } from "@/lib/api/mockdata";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const listing = mockListings.find((item) => item.id === id);
  if (!listing) notFound();

  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Manage photos
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Drag to reorder. The first photo is what seekers see in search
          results.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {listing.photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-4/3 overflow-hidden rounded-card bg-surface-sunken"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              width={photo.width}
              height={photo.height}
              className="size-full object-cover"
            />

            {index === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-2xs font-medium text-ink-inverse">
                Cover
              </span>
            )}

            <button
              type="button"
              aria-label={`Remove photo ${index + 1}`}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-ink/70 text-ink-inverse hover:bg-ink"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Button variant="secondary" className="mt-5">
        Add more photos
      </Button>
    </div>
  );
}
