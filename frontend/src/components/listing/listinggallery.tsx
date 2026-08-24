"use client";

import { useState } from "react";
import type { Photo } from "@/types/photo";
import { WatermarkedImage } from "@/components/ui/watermarkedimage";
import { cn } from "@/lib/utils/classnames";

const SAMPLE_ROOM_PHOTOS: Photo[] = [
  {
    id: "sample-1",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    width: 1200,
    height: 800,
    blurhash: null,
    position: 0,
  },
  {
    id: "sample-2",
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    width: 1200,
    height: 800,
    blurhash: null,
    position: 1,
  },
  {
    id: "sample-3",
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    width: 1200,
    height: 800,
    blurhash: null,
    position: 2,
  },
  {
    id: "sample-4",
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    width: 1200,
    height: 800,
    blurhash: null,
    position: 3,
  },
];

export function ListingGallery({
  photos,
  title,
  listingId: _listingId,
}: {
  photos: Photo[];
  title: string;
  listingId?: string;
}) {
  // Use uploaded photos or graceful sample room images if none/few uploaded
  const displayPhotos =
    photos.length > 0
      ? photos
      : SAMPLE_ROOM_PHOTOS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = displayPhotos.length;
  const currentPhoto: Photo = displayPhotos[currentIndex] || displayPhotos[0] || (SAMPLE_ROOM_PHOTOS[0] as Photo);

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
      }
    }
  }

  function handlePrev(e?: React.MouseEvent) {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }

  function handleNext(e?: React.MouseEvent) {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* 1. Main Hero Carousel Frame (OLX Style) */}
      <div className="relative aspect-4/3 sm:aspect-16/10 md:aspect-16/9 w-full overflow-hidden rounded-xl bg-black flex items-center justify-center group shadow-md select-none">
        {/* Main Photo with roombazar Watermark */}
        <div
          onClick={() => setFullscreen(true)}
          className="size-full cursor-zoom-in flex items-center justify-center"
        >
          <WatermarkedImage
            src={currentPhoto.url}
            alt={`${title} - Photo ${currentIndex + 1}`}
            fill
            className="size-full object-contain sm:object-cover transition-opacity duration-200"
            watermarkText="roombazar"
          />
        </div>

        {/* Top Controls Overlay: Title Bar & Share Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs shadow-xs pointer-events-auto">
            {currentIndex + 1} / {total} Photos
          </span>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share listing"
              className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs transition-all hover:bg-black/80 active:scale-95 shadow-xs"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Chevron Buttons (Left / Right) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 flex size-9 sm:size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all hover:bg-black/85 hover:scale-105 active:scale-95 shadow-md z-20"
            >
              <svg className="size-5 sm:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 flex size-9 sm:size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all hover:bg-black/85 hover:scale-105 active:scale-95 shadow-md z-20"
            >
              <svg className="size-5 sm:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Bottom Pagination Dots */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none">
            {displayPhotos.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "size-2 rounded-full transition-all duration-200",
                  idx === currentIndex
                    ? "bg-white w-5 shadow-xs"
                    : "bg-white/50 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Thumbnail Selector Strip */}
      {total > 1 && (
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {displayPhotos.map((photo, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={photo.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative aspect-4/3 w-20 sm:w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all active:scale-95",
                  isSelected
                    ? "border-brand-600 ring-2 ring-brand-600/30 opacity-100 scale-[1.02]"
                    : "border-line opacity-65 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="size-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Fullscreen Lightbox Modal */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setFullscreen(false)}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between text-white z-30">
            <span className="text-sm font-semibold tracking-wide">
              {currentIndex + 1} of {total} · {title}
            </span>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 active:scale-95"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Centered Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[80vh] max-w-[90vw] flex items-center justify-center"
          >
            <WatermarkedImage
              src={currentPhoto.url}
              alt={title}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              watermarkText="roombazar"
            />

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute -left-3 sm:-left-12 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 active:scale-95 shadow-md"
                >
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute -right-3 sm:-right-12 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 active:scale-95 shadow-md"
                >
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Footer dots */}
          <div className="flex gap-2">
            {displayPhotos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "size-2.5 rounded-full transition-all",
                  idx === currentIndex ? "bg-brand-500 w-6" : "bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
