"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createListing } from "@/lib/api/createlisting";
import { discardDraft } from "@/lib/api/listingdraft";
import { ApiRequestError } from "@/lib/api/client";
import {
  useListingDraft,
  draftToPayload,
} from "@/store/listingdraftstore";
import { useListingDraftSync } from "@/hooks/uselistingdraftsync";
import { useIndiaLocations } from "@/hooks/useindialocations";
import { useAmenities } from "@/hooks/useamenities";
import {
  roomTypeLabels,
  roomTypeOrder,
  postedByLabels,
  furnishingLabels,
} from "@/lib/constants/roomtypes";
import { tenantPreferenceLabels } from "@/lib/constants/tenantpreferences";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";
import {
  kindOf,
  requestSignature,
  uploadToCloudinary,
  type UploadedMedia,
} from "@/lib/api/uploads";
import { stampWatermarkOnImage } from "@/lib/utils/watermark";
import type { Furnishing, PostedBy, TenantPreference } from "@/types/listing";

const MAX_FILES = 12;

interface PendingUpload {
  id: string;
  name: string;
  previewUrl: string;
  kind: "image" | "video";
  percent: number;
  error: string | null;
}

const tenantOptions: TenantPreference[] = [
  "any",
  "family",
  "workingprofessional",
  "student",
  "bachelormale",
  "bachelorfemale",
];

export default function PostAdPage() {
  const router = useRouter();
  const { draft, update, toggleAmenity, addMedia, removeMedia, reset, hydrated } =
    useListingDraft();
  const saveState = useListingDraftSync();

  const {
    states,
    districts,
    cities,
    loadingStates,
    loadingDistricts,
    loadingCities,
    error: locationError,
    retry: retryLocations,
  } = useIndiaLocations(draft.stateCode, draft.districtSlug);

  const amenities = useAmenities();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [pending]);

  const totalFiles = draft.media.length + pending.length;
  const isUploading = pending.some((item) => !item.error);

  // Multi-upload handler
  async function handleFiles(files: FileList) {
    const availableSlots = MAX_FILES - totalFiles;
    const chosen = Array.from(files).slice(0, Math.max(0, availableSlots));

    for (const rawFile of chosen) {
      const kind = kindOf(rawFile);
      // Physically stamp roombazar watermark on image
      const file = kind === "image" ? await stampWatermarkOnImage(rawFile, "roombazar") : rawFile;
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;

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
            `File exceeds maximum allowed size of ${Math.round(
              signature.maxBytes / (1024 * 1024),
            )}MB.`,
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
      } catch (err) {
        setPending((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  error: err instanceof Error ? err.message : "Upload failed.",
                }
              : item,
          ),
        );
      }
    }
  }

  function togglePreference(value: TenantPreference) {
    if (value === "any") {
      update({
        preferredTenant: draft.preferredTenant.includes("any") ? [] : ["any"],
      });
      return;
    }

    const withoutAny = draft.preferredTenant.filter((item) => item !== "any");
    update({
      preferredTenant: withoutAny.includes(value)
        ? withoutAny.filter((item) => item !== value)
        : [...withoutAny, value],
    });
  }

  async function handlePublish() {
    if (isUploading || publishing) return;

    setPublishing(true);
    setError(null);

    try {
      const payload = draftToPayload(draft);
      const listing = await createListing(payload);

      reset();
      await discardDraft().catch(() => undefined);
      router.push(routes.myListing(listing.id));
    } catch (cause) {
      if (cause instanceof ApiRequestError) {
        const fields = cause.body.fields ?? {};
        const detail = Object.entries(fields)
          .map(([name, message]) => `${name}: ${message}`)
          .join(" · ");

        setError(detail ? `${cause.body.message} — ${detail}` : cause.body.message);
      } else {
        setError(
          "Could not publish the listing. Check your connection and try again.",
        );
      }
      setPublishing(false);
    }
  }

  const depositMonths =
    draft.rentRupees && draft.depositRupees
      ? (draft.depositRupees / draft.rentRupees).toFixed(1).replace(/\.0$/, "")
      : null;

  return (
    <div className="mx-auto max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
      {/* Title & Category Bar */}
      <div className="mb-5 sm:mb-6 text-center">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-ink">
          POST YOUR AD
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          List your room or property in under a minute · Zero commission
        </p>

        {/* Draft Auto-save status */}
        {hydrated && saveState !== "idle" && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs border border-line shadow-2xs">
            <span
              className={cn(
                "size-2 rounded-full",
                saveState === "saving" && "bg-amber-500 animate-ping",
                saveState === "saved" && "bg-emerald-500",
                saveState === "error" && "bg-danger",
              )}
            />
            <span className="text-ink-muted text-[11px] sm:text-xs">
              {saveState === "saving" && "Saving draft…"}
              {saveState === "saved" && "Draft auto-saved"}
              {saveState === "error" && "Draft not saved to cloud"}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* SECTION 1: INCLUDE SOME DETAILS */}
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-ink border-b border-line pb-2.5 sm:pb-3">
            1. Include Some Details
          </h2>

          <div className="mt-4 sm:mt-5 space-y-4 sm:space-y-5">
            {/* Room Type Pills */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {roomTypeOrder.map((type) => {
                  const isSelected = draft.roomType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update({ roomType: type })}
                      className={cn(
                        "flex items-center justify-center rounded-lg border px-2 py-2.5 text-center text-xs sm:text-sm font-medium transition-all active:scale-[0.98]",
                        isSelected
                          ? "border-brand-600 bg-brand-600 text-white shadow-xs font-semibold"
                          : "border-line-strong bg-surface text-ink hover:border-ink/40 hover:bg-surface-muted",
                      )}
                    >
                      {roomTypeLabels[type]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listed By */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
                Listed by
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(postedByLabels) as PostedBy[]).map((val) => {
                  const isSelected = draft.postedBy === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update({ postedBy: val })}
                      className={cn(
                        "flex items-center justify-center rounded-lg border px-2 py-2.5 text-center text-xs sm:text-sm font-medium transition-all active:scale-[0.98]",
                        isSelected
                          ? "border-brand-600 bg-brand-600 text-white shadow-xs font-semibold"
                          : "border-line-strong bg-surface text-ink hover:border-ink/40 hover:bg-surface-muted",
                      )}
                    >
                      {postedByLabels[val]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
                Furnishing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(furnishingLabels) as Furnishing[]).map((val) => {
                  const isSelected = draft.furnishing === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update({ furnishing: val })}
                      className={cn(
                        "flex items-center justify-center rounded-lg border px-2 py-2.5 text-center text-xs sm:text-sm font-medium transition-all active:scale-[0.98]",
                        isSelected
                          ? "border-brand-600 bg-brand-600 text-white shadow-xs font-semibold"
                          : "border-line-strong bg-surface text-ink hover:border-ink/40 hover:bg-surface-muted",
                      )}
                    >
                      {furnishingLabels[val]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suitable For / Tenant Preference */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
                Suitable For
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tenantOptions.map((val) => {
                  const isSelected = draft.preferredTenant.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => togglePreference(val)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98]",
                        isSelected
                          ? "border-brand-600 bg-brand-50 text-brand-700 font-semibold"
                          : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
                      )}
                    >
                      {tenantPreferenceLabels[val]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area, Floor, Total Floors */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <Input
                label="Super Builtup Area (sq ft)"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 450"
                value={draft.areaSqft ?? ""}
                onChange={(e) =>
                  update({ areaSqft: e.target.value ? Number(e.target.value) : null })
                }
              />
              <Input
                label="Floor No"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 2"
                value={draft.floor ?? ""}
                onChange={(e) =>
                  update({ floor: e.target.value ? Number(e.target.value) : null })
                }
              />
              <Input
                label="Total Floors"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 4"
                value={draft.totalFloors ?? ""}
                onChange={(e) =>
                  update({ totalFloors: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>

            {/* Ad Title */}
            <Input
              label="Ad Title"
              placeholder="e.g. Spacious semi-furnished 1 BHK with balcony near Metro"
              hint="Mention key highlight (e.g. Attached washroom, near IT Park)"
              value={draft.title}
              maxLength={120}
              onChange={(e) => update({ title: e.target.value })}
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Include details on maintenance, water timing, nearby markets, restrictions, etc."
              rows={4}
              maxLength={1500}
              showCount
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>
        </section>

        {/* SECTION 2: SET A PRICE & TERMS */}
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-ink border-b border-line pb-2.5 sm:pb-3">
            2. Set a Price & Terms
          </h2>

          <div className="mt-4 sm:mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Input
                label="Monthly Rent"
                type="number"
                inputMode="numeric"
                prefix="₹"
                suffix="/ month"
                placeholder="12000"
                value={draft.rentRupees ?? ""}
                onChange={(e) =>
                  update({ rentRupees: e.target.value ? Number(e.target.value) : null })
                }
              />

              <Input
                label="Security Deposit"
                type="number"
                inputMode="numeric"
                prefix="₹"
                placeholder="24000"
                hint={depositMonths ? `Approx. ${depositMonths} months rent` : "0 if no deposit"}
                value={draft.depositRupees ?? ""}
                onChange={(e) =>
                  update({ depositRupees: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <Input
                label="Maintenance"
                type="number"
                inputMode="numeric"
                prefix="₹"
                suffix="/ mo"
                placeholder="1000"
                value={draft.maintenanceRupees ?? ""}
                onChange={(e) =>
                  update({
                    maintenanceRupees: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />

              <Input
                label="Available From"
                type="date"
                value={draft.availableFrom ?? ""}
                onChange={(e) =>
                  update({ availableFrom: e.target.value || null })
                }
              />

              <Select
                label="Minimum Stay"
                placeholder="No minimum"
                options={[
                  { value: "1", label: "1 month" },
                  { value: "3", label: "3 months" },
                  { value: "6", label: "6 months" },
                  { value: "11", label: "11 months" },
                ]}
                value={draft.minStayMonths?.toString() ?? ""}
                onChange={(e) =>
                  update({
                    minStayMonths: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 pt-3 border-t border-line">
              <Checkbox
                label="Electricity and water included in rent"
                checked={draft.billsIncluded}
                onChange={(e) => update({ billsIncluded: e.target.checked })}
              />
              <Checkbox
                label="Rent is negotiable"
                checked={draft.negotiable}
                onChange={(e) => update({ negotiable: e.target.checked })}
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: UPLOAD PHOTOS */}
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-line pb-2.5 sm:pb-3">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-ink">
              3. Upload Photos (Optional)
            </h2>
            <span className="text-xs text-ink-muted">
              {totalFiles} / {MAX_FILES} photos
            </span>
          </div>

          <div className="mt-4 sm:mt-5 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm"
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />

            {/* Dropzone button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={totalFiles >= MAX_FILES}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-xl",
                "border-2 border-dashed border-line-strong bg-surface-muted/50 px-4 py-6 sm:px-6 sm:py-8",
                "text-center transition-all hover:border-brand-500 hover:bg-brand-50/40 active:scale-[0.99]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <svg className="size-5 sm:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-ink">
                {totalFiles >= MAX_FILES ? "Maximum photos reached" : "Click or tap to add photos / video"}
              </span>
              <span className="text-[11px] sm:text-xs text-ink-muted">
                JPG, PNG, WebP or MP4 · Up to {MAX_FILES} media files
              </span>
            </button>

            {/* Uploaded Media Grid */}
            {totalFiles > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 sm:gap-2.5">
                {draft.media.map((item, index) => (
                  <figure
                    key={item.publicId}
                    className="group relative aspect-4/3 overflow-hidden rounded-lg bg-surface-sunken border border-line"
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
                      <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Cover
                      </span>
                    )}

                    {item.kind === "video" && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {item.durationSeconds ? `${Math.round(item.durationSeconds)}s` : "Video"}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeMedia(item.publicId)}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 flex size-5 sm:size-6 items-center justify-center rounded-full bg-black/75 text-xs text-white opacity-90 transition-opacity hover:opacity-100 active:scale-95"
                    >
                      ×
                    </button>
                  </figure>
                ))}

                {/* Pending Uploads */}
                {pending.map((item) => (
                  <figure
                    key={item.id}
                    className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface-sunken border border-line"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="size-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1">
                      {item.error ? (
                        <>
                          <span className="text-[10px] text-danger font-medium text-center leading-tight">
                            {item.error}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPending((cur) => cur.filter((p) => p.id !== item.id))
                            }
                            className="text-[10px] text-ink underline"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] font-semibold text-ink">
                            {item.percent}%
                          </span>
                          <div className="h-1 w-3/4 overflow-hidden rounded-full bg-surface">
                            <div
                              className="h-full bg-brand-600 transition-all"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: CONFIRM YOUR LOCATION */}
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-ink border-b border-line pb-2.5 sm:pb-3">
            4. Confirm Your Location (Optional)
          </h2>

          <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
            {locationError && (
              <div
                role="alert"
                className="rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-2.5"
              >
                <p className="text-xs text-danger">{locationError}</p>
                <button
                  type="button"
                  onClick={retryLocations}
                  className="mt-1 text-xs font-medium text-danger underline"
                >
                  Try again
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <Select
                label="State"
                placeholder={loadingStates ? "Loading states..." : "Select State"}
                options={states.map((s) => ({ value: s.code, label: s.name }))}
                value={draft.stateCode ?? ""}
                disabled={loadingStates || states.length === 0}
                onChange={(e) =>
                  update({
                    stateCode: e.target.value,
                    districtSlug: null,
                    citySlug: null,
                    localitySlug: null,
                  })
                }
              />

              <Select
                label="District"
                placeholder={
                  !draft.stateCode
                    ? "Select state first"
                    : loadingDistricts
                      ? "Loading districts..."
                      : "Select District"
                }
                options={districts.map((d) => ({ value: d.slug, label: d.name }))}
                value={draft.districtSlug ?? ""}
                disabled={!draft.stateCode || loadingDistricts || districts.length === 0}
                onChange={(e) =>
                  update({
                    districtSlug: e.target.value,
                    citySlug: e.target.value,
                    localitySlug: null,
                  })
                }
              />

              <Select
                label="City / Locality"
                placeholder={
                  !draft.districtSlug
                    ? "Select district first"
                    : loadingCities
                      ? "Loading localities..."
                      : "Select City / Area"
                }
                options={cities.map((c) => ({ value: c.slug, label: c.name }))}
                value={draft.localitySlug ?? ""}
                disabled={!draft.districtSlug || loadingCities || cities.length === 0}
                onChange={(e) => update({ localitySlug: e.target.value })}
              />
            </div>

            <Input
              label="House / Building / Street Address (optional)"
              placeholder="e.g. Flat 302, Green Glen Layout, Outer Ring Road"
              hint="Your exact address is never shown publicly. Seekers only see an approximate radius."
              value={draft.addressLine}
              onChange={(e) => update({ addressLine: e.target.value })}
            />
          </div>
        </section>

        {/* SECTION 5: AMENITIES & FEATURES */}
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-line pb-2.5 sm:pb-3">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-ink">
              5. Amenities & Rules (Optional)
            </h2>
            <span className="text-xs text-ink-muted font-medium">
              {draft.amenitySlugs.length} selected
            </span>
          </div>

          <div className="mt-3.5 sm:mt-4">
            <p className="text-xs text-ink-muted mb-2.5 sm:mb-3">
              Tap any feature available in your room or flat:
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {amenities.map((amenity) => {
                const isChecked = draft.amenitySlugs.includes(amenity.slug);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.slug)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium transition-all active:scale-95",
                      isChecked
                        ? "border-brand-600 bg-brand-50 text-brand-700 font-semibold shadow-2xs"
                        : "border-line bg-surface text-ink hover:bg-surface-muted",
                    )}
                  >
                    <span>{isChecked ? "✓" : "+"}</span>
                    <span>{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ERROR & VALIDATION ALERTS */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger-soft p-3.5 sm:p-4"
          >
            <p className="text-xs sm:text-sm font-medium text-danger">{error}</p>
          </div>
        )}

        {isUploading && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-50 p-3.5 sm:p-4">
            <p className="text-xs sm:text-sm font-semibold text-amber-700">
              Photos are still uploading. Please wait a moment before posting...
            </p>
          </div>
        )}

        {/* POST NOW ACTION BAR */}
        <div className="sticky bottom-0 sm:static bg-surface/95 backdrop-blur-md p-4 sm:p-5 border-t sm:border border-line rounded-none sm:rounded-xl shadow-lg sm:shadow-sm -mx-3 sm:mx-0 z-20 text-center">
          <Button
            size="lg"
            fullWidth
            onClick={() => void handlePublish()}
            loading={publishing}
            disabled={publishing || isUploading}
            className="h-12 sm:h-13 text-sm sm:text-base font-bold tracking-wide uppercase shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
          >
            {publishing ? "Publishing Your Ad…" : "Post Now"}
          </Button>

          <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-ink-muted">
            By publishing, you confirm your room is genuinely available. Read our{" "}
            <Link href={routes.terms} className="underline hover:text-ink">
              Terms & Conditions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
