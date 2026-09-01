import type { Photo } from "@/types/photo";

export function ListingGallery({
  photos,
  title,
}: {
  photos: Photo[];
  title: string;
}) {
  if (photos.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-card bg-surface-sunken text-sm text-ink-subtle">
        No photos uploaded yet
      </div>
    );
  }

  const [cover, ...rest] = photos;

  return (
    <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.url}
          alt={`${title} - Main photo`}
          width={cover.width}
          height={cover.height}
          loading="eager"
          className="aspect-4/3 w-full rounded-card object-cover shadow-xs"
        />
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
          {rest.slice(0, 3).map((photo, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={`${title} - Room view ${idx + 2}`}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              className="aspect-4/3 w-full rounded-card object-cover shadow-xs"
            />
          ))}
        </div>
      )}
    </div>
  );
}
