"use client";

import { useEffect, useRef, useState } from "react";
import { StepShell } from "@/components/listingform/stepshell";
import { Button } from "@/components/ui/button";
import { useListingDraft } from "@/store/listingdraftstore";
import { cn } from "@/lib/utils/classnames";
import {
  kindOf,
  requestSignature,
  uploadToCloudinary,
  type UploadedMedia,
} from "@/lib/api/uploads";

const MAX_FILES = 12;

interface Pending {
  id: string;
  name: string;
  previewUrl: string;
  kind: "image" | "video";
  percent: number;
  error: string | null;
}

/**
 * Photos and video for a listing.
 *
 * Files go straight from the browser to Cloudinary using a signature this
 * server issues, so a large upload never passes through the API. Each file
 * shows its own progress: previously a placeholder said "Uploading…" forever
 * because nothing was actually being sent.
 */
export default function Page() {
  const { draft, addMedia, removeMedia } = useListingDraft();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);

  // Object URLs are only freed on unmount, because revoking one while its
  // thumbnail is still on screen blanks the preview mid-upload.
  useEffect(() => {
    return () => {
      pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [pending]);

  const total = draft.media.length + pending.length;
  const uploading = pending.some((item) => !item.error);

  async function handleFiles(files: FileList) {
    const room = MAX_FILES - total;
    const chosen = Array.from(files).slice(0, Math.max(0, room));

    for (const file of chosen) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const kind = kindOf(file);

      setPending((current) => [
        ...current,
        {
          id,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
          kind,
          percent: 0,
          error: null,
        },
      ]);

      try {
        const signature = await requestSignature(kind);

        if (file.size > signature.maxBytes) {
          throw new Error(
            `That file is larger than ${Math.round(signature.maxBytes / (1024 * 1024))}MB.`,
          );
        }

        const uploaded: UploadedMedia = await uploadToCloudinary(
          file,
          signature,
          (percent) =>
            setPending((current) =>
              current.map((item) =>
                item.id === id ? { ...item, percent } : item,
              ),
            ),
        );

        addMedia(uploaded);
        setPending((current) => current.filter((item) => item.id !== id));
      } catch (error) {
        setPending((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  error:
                    error instanceof Error ? error.message : "Upload failed.",
                }
              : item,
          ),
        );
      }
    }
  }

  return (
    <StepShell
      step="photos"
      title="Add photos"
      description="At least one is required. Rooms with three or more photos get far more enquiries, and a short video helps even more."
      canContinue={draft.media.length > 0 && !uploading}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.length) void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={total >= MAX_FILES}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-card",
          "border-2 border-dashed border-line-strong bg-surface-muted px-6 py-12",
          "text-center transition-colors hover:border-brand-400 hover:bg-brand-50",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <span className="text-sm font-medium text-ink">
          {total >= MAX_FILES ? "Maximum reached" : "Tap to add photos or video"}
        </span>
        <span className="text-xs text-ink-muted">
          JPG, PNG, WebP or HEIC · MP4, MOV or WebM · up to {MAX_FILES} files
        </span>
      </button>

      {total > 0 && (
        <div>
          <p className="mb-2 text-sm text-ink-muted">
            {total} {total === 1 ? "file" : "files"} · the first one is your cover
          </p>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {draft.media.map((item, index) => (
              <figure
                key={item.publicId}
                className="relative aspect-4/3 overflow-hidden rounded-control bg-surface-sunken"
              >
                {item.kind === "video" ? (
                  <video
                    src={item.secureUrl}
                    className="size-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.secureUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                )}

                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-2xs font-medium text-ink-inverse">
                    Cover
                  </span>
                )}

                {item.kind === "video" && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-2xs font-medium text-ink-inverse">
                    {item.durationSeconds
                      ? `${Math.round(item.durationSeconds)}s`
                      : "Video"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removeMedia(item.publicId)}
                  aria-label={`Remove file ${index + 1}`}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-ink/70 text-ink-inverse hover:bg-ink"
                >
                  ×
                </button>
              </figure>
            ))}

            {pending.map((item) => (
              <figure
                key={item.id}
                className="relative aspect-4/3 overflow-hidden rounded-control bg-surface-sunken"
              >
                {item.kind === "video" ? (
                  <video
                    src={item.previewUrl}
                    className="size-full object-cover opacity-40"
                    muted
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="size-full object-cover opacity-40"
                  />
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2">
                  {item.error ? (
                    <>
                      <span className="text-center text-2xs font-medium text-danger">
                        {item.error}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPending((current) =>
                            current.filter((entry) => entry.id !== item.id),
                          )
                        }
                        className="text-2xs text-ink-muted underline"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-medium tabular-nums text-ink">
                        {item.percent}%
                      </span>
                      <span
                        role="progressbar"
                        aria-valuenow={item.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-1.5 w-3/4 overflow-hidden rounded-full bg-surface"
                      >
                        <span
                          className="block h-full rounded-full bg-brand-600 transition-[width] duration-200"
                          style={{ width: `${item.percent}%` }}
                        />
                      </span>
                    </>
                  )}
                </div>
              </figure>
            ))}
          </div>
        </div>
      )}

      <aside className="rounded-card border border-line bg-surface-muted p-4">
        <p className="text-sm text-ink-muted">
          Location data is stripped from every file before it is published, so
          your address cannot be read out of the image.
        </p>
      </aside>

      {uploading && (
        <p className="text-sm text-ink-muted">
          Waiting for uploads to finish before you continue.
        </p>
      )}

      {total > 0 && total < MAX_FILES && (
        <Button
          variant="secondary"
          fullWidth
          onClick={() => inputRef.current?.click()}
        >
          Add more
        </Button>
      )}
    </StepShell>
  );
}
