"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useListingDraft, missingFields, draftToPayload } from "@/store/listingdraftstore";
import { useListingDraftSync } from "@/hooks/uselistingdraftsync";
import { useIndiaLocations } from "@/hooks/useindialocations";
import { useAmenities } from "@/hooks/useamenities";
import { createListing } from "@/lib/api/createlisting";
import { discardDraft } from "@/lib/api/listingdraft";
import { ApiRequestError } from "@/lib/api/client";
import {
  roomTypeLabels,
  roomTypeOrder,
  furnishingLabels,
} from "@/lib/constants/roomtypes";
import { tenantPreferenceLabels } from "@/lib/constants/tenantpreferences";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/classnames";
import {
  fetchStates,
  fetchDistricts,
  fetchDistrictCities,
} from "@/lib/api/geography";
import {
  ALL_INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CITIES_BY_DISTRICT,
} from "@/lib/constants/indiaLocations";
import {
  kindOf,
  requestSignature,
  uploadToCloudinary,
  type UploadedMedia,
} from "@/lib/api/uploads";
import type { RoomType, Furnishing, TenantPreference } from "@/types/listing";

const MAX_FILES = 12;

function normaliseGeo(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface PendingUpload {
  id: string;
  name: string;
  previewUrl: string;
  kind: "image" | "video";
  percent: number;
  error: string | null;
}

const ROOM_TYPE_ICONS: Record<RoomType, React.ReactNode> = {
  singleroom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  sharedroom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  pgbed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
    </svg>
  ),
  rk1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 12h18M12 3v18" />
    </svg>
  ),
  bhk1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M3 14h6" />
    </svg>
  ),
  bhk2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 3v18M16 3v18M3 12h18" />
    </svg>
  ),
  bhk3plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <rect x="9" y="13" width="6" height="8" />
      <line x1="12" y1="5" x2="12" y2="9" />
    </svg>
  ),
  hostelbed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <path d="M3 7h18v14H3zM3 12h18M8 7v5" />
    </svg>
  ),
};

const TENANT_OPTIONS: TenantPreference[] = [
  "any",
  "family",
  "workingprofessional",
  "student",
  "bachelormale",
  "bachelorfemale",
];

export default function SinglePagePostRoom() {
  const router = useRouter();
  const { draft, update, toggleAmenity, addMedia, removeMedia, reset } =
    useListingDraft();
  const hydrated = useListingDraft((state) => state.hydrated);
  const saveState = useListingDraftSync();
  const amenities = useAmenities();

  const {
    states,
    districts,
    cities,
    loadingStates,
    loadingDistricts,
    loadingCities,
  } = useIndiaLocations(draft.stateCode, draft.districtSlug);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  function useMyCurrentLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsMessage({
        type: "error",
        text: "Geolocation is not supported by your browser. Please select your location from the dropdowns below.",
      });
      return;
    }

    setGpsLoading(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const lat = Math.round(coords.latitude * 100000) / 100000;
          const lng = Math.round(coords.longitude * 100000) / 100000;

          // 1. Fetch reverse geocoding from OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const result = await response.json();
          const rawAddress = result.address || {};

          const detectedStateName = rawAddress.state || "";
          const detectedDistrictName =
            rawAddress.state_district ||
            rawAddress.county ||
            rawAddress.district ||
            "";
          const detectedCityName =
            rawAddress.city ||
            rawAddress.town ||
            rawAddress.village ||
            rawAddress.municipality ||
            "";
          const detectedLocalityName =
            rawAddress.suburb ||
            rawAddress.neighbourhood ||
            rawAddress.residential ||
            rawAddress.quarter ||
            "";
          const detectedRoad =
            rawAddress.road ||
            rawAddress.suburb ||
            rawAddress.neighbourhood ||
            "";
          const detectedPostcode = rawAddress.postcode || "";

          // Construct formatted street address with road, landmark & pincode
          const addressParts = [
            rawAddress.house_number,
            rawAddress.building,
            detectedRoad,
            detectedLocalityName && detectedLocalityName !== detectedRoad
              ? detectedLocalityName
              : null,
            detectedPostcode ? `PIN: ${detectedPostcode}` : null,
          ].filter(Boolean);
          const autoAddressLine = addressParts.join(", ") || detectedRoad;

          // 2. Match State from available states
          const allStates =
            states.length > 0 ? states : ALL_INDIAN_STATES;
          const cleanDetectedState = normaliseGeo(detectedStateName);
          const matchedState = allStates.find((s) => {
            const sName = normaliseGeo(s.name);
            return (
              sName === cleanDetectedState ||
              cleanDetectedState.includes(sName) ||
              sName.includes(cleanDetectedState)
            );
          });

          let matchedDistrictSlug: string | null = null;
          let matchedLocalitySlug: string | null = null;

          // 3. Match District if state was matched
          if (matchedState) {
            try {
              const staticDists = DISTRICTS_BY_STATE[matchedState.code] || [];
              let districtList: typeof staticDists = staticDists;
              try {
                const apiDists = await fetchDistricts(matchedState.code);
                if (apiDists && apiDists.length > 0) {
                  const slugs = new Set(apiDists.map((d) => d.slug));
                  districtList = [
                    ...apiDists,
                    ...staticDists.filter((d) => !slugs.has(d.slug)),
                  ];
                }
              } catch {
                districtList = staticDists;
              }

              const cleanDetectedDist = normaliseGeo(detectedDistrictName);
              const cleanDetectedCity = normaliseGeo(detectedCityName);

              const matchedDist = districtList.find((d) => {
                const dName = normaliseGeo(d.name);
                return (
                  (cleanDetectedDist &&
                    (dName === cleanDetectedDist ||
                      cleanDetectedDist.includes(dName) ||
                      dName.includes(cleanDetectedDist))) ||
                  (cleanDetectedCity &&
                    (dName === cleanDetectedCity ||
                      cleanDetectedCity.includes(dName) ||
                      dName.includes(cleanDetectedCity)))
                );
              }) || districtList[0];

              if (matchedDist) {
                matchedDistrictSlug = matchedDist.slug;

                // 4. Match City / Locality if district was matched
                const staticCities = CITIES_BY_DISTRICT[matchedDist.slug] || [];
                let cityList: typeof staticCities = staticCities;
                try {
                  const apiCities = await fetchDistrictCities(matchedDist.slug);
                  if (apiCities && apiCities.length > 0) {
                    const cSlugs = new Set(apiCities.map((c) => c.slug));
                    cityList = [
                      ...apiCities,
                      ...staticCities.filter((c) => !cSlugs.has(c.slug)),
                    ];
                  }
                } catch {
                  cityList = staticCities;
                }

                const cleanDetectedLoc = normaliseGeo(detectedLocalityName);
                const cleanDetectedRoad = normaliseGeo(detectedRoad);

                const matchedLoc = cityList.find((c) => {
                  const cName = normaliseGeo(c.name);
                  return (
                    (cleanDetectedLoc &&
                      (cName === cleanDetectedLoc ||
                        cleanDetectedLoc.includes(cName) ||
                        cName.includes(cleanDetectedLoc))) ||
                    (cleanDetectedRoad &&
                      (cName === cleanDetectedRoad ||
                        cleanDetectedRoad.includes(cName) ||
                        cName.includes(cleanDetectedRoad))) ||
                    (cleanDetectedCity &&
                      (cName === cleanDetectedCity ||
                        cleanDetectedCity.includes(cName) ||
                        cName.includes(cleanDetectedCity)))
                  );
                }) || cityList[0];

                matchedLocalitySlug =
                  matchedLoc?.slug ||
                  (cityList[0]?.slug ?? matchedDist.slug);
              }
            } catch {
              // Graceful fallback
            }
          }

          // 5. Update draft with all matched location fields
          update({
            lat,
            lng,
            ...(matchedState ? { stateCode: matchedState.code } : {}),
            ...(matchedDistrictSlug
              ? {
                  districtSlug: matchedDistrictSlug,
                  citySlug: matchedDistrictSlug,
                }
              : {}),
            ...(matchedLocalitySlug ? { localitySlug: matchedLocalitySlug } : {}),
            ...(autoAddressLine ? { addressLine: autoAddressLine } : {}),
          });

          const locationSummary =
            [detectedCityName || detectedDistrictName, detectedStateName]
              .filter(Boolean)
              .join(", ") || `${lat}, ${lng}`;

          setGpsMessage({
            type: "success",
            text: `GPS location captured: ${locationSummary}`,
          });
        } catch {
          update({ lat: coords.latitude, lng: coords.longitude });
          setGpsMessage({
            type: "success",
            text: `GPS coordinates captured (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
          });
        } finally {
          setGpsLoading(false);
        }
      },
      (geoError) => {
        setGpsLoading(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setGpsMessage({
            type: "error",
            text: "Location permission was denied. Please allow location access or choose your location using the dropdowns below.",
          });
        } else {
          setGpsMessage({
            type: "error",
            text: "Unable to get your current location. Please try again or select from the dropdowns below.",
          });
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  useEffect(() => {
    return () => {
      pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [pending]);

  const totalFiles = draft.media.length + pending.length;
  const isUploading = pending.some((item) => !item.error);
  const missing = missingFields(draft);
  const isReady = missing.length === 0;

  async function handleFiles(files: FileList) {
    const availableSlots = MAX_FILES - totalFiles;
    const chosen = Array.from(files).slice(0, Math.max(0, availableSlots));

    for (const file of chosen) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const kind = kindOf(file);

      setPending((curr) => [
        ...curr,
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
            `File exceeds ${Math.round(signature.maxBytes / (1024 * 1024))}MB limit.`,
          );
        }

        const uploaded: UploadedMedia = await uploadToCloudinary(
          file,
          signature,
          (percent) =>
            setPending((curr) =>
              curr.map((item) => (item.id === id ? { ...item, percent } : item)),
            ),
        );

        addMedia(uploaded);
        setPending((curr) => curr.filter((item) => item.id !== id));
      } catch (err) {
        setPending((curr) =>
          curr.map((item) =>
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

  function toggleTenantPreference(val: TenantPreference) {
    if (val === "any") {
      update({
        preferredTenant: draft.preferredTenant.includes("any") ? [] : ["any"],
      });
      return;
    }
    const withoutAny = draft.preferredTenant.filter((i) => i !== "any");
    update({
      preferredTenant: withoutAny.includes(val)
        ? withoutAny.filter((i) => i !== val)
        : [...withoutAny, val],
    });
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setSubmittedAttempt(true);

    if (!isReady) {
      // Scroll to the first error area smoothly
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    if (publishing || isUploading) return;

    setPublishing(true);
    setError(null);

    try {
      const payload = draftToPayload(draft);
      const created = await createListing(payload);

      reset();
      await discardDraft().catch(() => undefined);
      router.push(routes.myListing(created.id));
    } catch (cause) {
      if (cause instanceof ApiRequestError) {
        const fields = cause.body.fields ?? {};
        const detail = Object.entries(fields)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" · ");
        setError(detail ? `${cause.body.message} — ${detail}` : cause.body.message);
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not publish your listing. Please try again.",
        );
      }
      setPublishing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-10">
      {/* Top Heading & Status */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Post Your Room Ad
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Simple 1-page form. Fill in details and connect with verified seekers.
          </p>
        </div>

        {hydrated && saveState !== "idle" && (
          <div className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
            {saveState === "saving" && (
              <>
                <span className="size-2 animate-ping rounded-full bg-brand-500" />
                <span>Auto-saving draft…</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <span className="size-2 rounded-full bg-success" />
                <span className="text-success font-medium">Draft auto-saved</span>
              </>
            )}
            {saveState === "error" && (
              <span className="text-danger">Changes on screen</span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handlePublish} className="space-y-8">
        {/* =========================================================================
            SECTION 1: SELECTED CATEGORY / ROOM TYPE (OLX STYLE)
            ========================================================================= */}
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                1
              </span>
              Type of Room / Space <span className="text-danger">*</span>
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Choose the category that best describes your space.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {roomTypeOrder.map((type) => {
              const selected = draft.roomType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => update({ roomType: type })}
                  aria-pressed={selected}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-3.5 text-center transition-all cursor-pointer",
                    selected
                      ? "border-brand-600 bg-brand-50/80 text-brand-700 font-bold shadow-xs scale-[1.02]"
                      : "border-line bg-surface hover:border-line-strong hover:bg-surface-muted text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors",
                      selected ? "text-brand-600" : "text-ink-muted",
                    )}
                  >
                    {ROOM_TYPE_ICONS[type]}
                  </span>
                  <span className="text-xs sm:text-sm leading-tight">
                    {roomTypeLabels[type]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: AD TITLE & DESCRIPTION
            ========================================================================= */}
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                2
              </span>
              Ad Title &amp; Description
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Add a catchy title and brief details about the place.
            </p>
          </div>

          <Input
            label="Ad Title"
            placeholder="e.g. Spacious 1 BHK with Balcony near Metro"
            hint="Leave blank if you'd like an automatic title built from your details."
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
          />

          <Textarea
            label="Description"
            placeholder="Mention key highlights, nearby landmarks, kitchen setup, water/electricity details, etc."
            maxLength={1500}
            showCount
            rows={4}
            value={draft.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </section>

        {/* =========================================================================
            SECTION 3: SET A PRICE & MOVE-IN
            ========================================================================= */}
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                3
              </span>
              Set a Price &amp; Move-in <span className="text-danger">*</span>
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Be accurate. Transparent pricing attracts more verified seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Monthly Rent *"
              type="number"
              inputMode="numeric"
              prefix="₹"
              suffix="/mo"
              placeholder="e.g. 12000"
              required
              value={draft.rentRupees ?? ""}
              onChange={(e) =>
                update({
                  rentRupees: e.target.value ? Number(e.target.value) : null,
                })
              }
            />

            <Input
              label="Security Deposit"
              type="number"
              inputMode="numeric"
              prefix="₹"
              placeholder="e.g. 25000 (0 if none)"
              value={draft.depositRupees ?? ""}
              onChange={(e) =>
                update({
                  depositRupees: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Maintenance (optional)"
              type="number"
              inputMode="numeric"
              prefix="₹"
              suffix="/mo"
              placeholder="0 if included"
              value={draft.maintenanceRupees ?? ""}
              onChange={(e) =>
                update({
                  maintenanceRupees: e.target.value
                    ? Number(e.target.value)
                    : null,
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
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line/60 pt-4">
            <Checkbox
              label="Electricity & water included in rent"
              checked={draft.billsIncluded}
              onChange={(e) => update({ billsIncluded: e.target.checked })}
            />
            <Checkbox
              label="Rent is negotiable"
              checked={draft.negotiable}
              onChange={(e) => update({ negotiable: e.target.checked })}
            />
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: CONFIRM LOCATION
            ========================================================================= */}
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  4
                </span>
                Confirm Your Location <span className="text-danger">*</span>
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Specify where your room is located so seekers nearby can discover it.
              </p>
            </div>

            {/* GPS Location Button */}
            <button
              type="button"
              onClick={useMyCurrentLocation}
              disabled={gpsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-brand-700 shadow-2xs transition-all hover:border-brand-400 hover:bg-brand-100 hover:shadow-xs active:scale-[0.98] disabled:opacity-60 cursor-pointer shrink-0"
            >
              {gpsLoading ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
                  <span>Detecting GPS…</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 text-brand-600"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="22" y1="12" x2="18" y2="12" />
                    <line x1="6" y1="12" x2="2" y2="12" />
                    <line x1="12" y1="6" x2="12" y2="2" />
                    <line x1="12" y1="22" x2="12" y2="18" />
                  </svg>
                  <span>📍 Use My Current Location</span>
                </>
              )}
            </button>
          </div>

          {/* GPS Status Message & Preview */}
          {gpsMessage && (
            <div
              role="alert"
              className={cn(
                "rounded-xl border p-3 text-xs sm:text-sm flex items-center justify-between gap-2",
                gpsMessage.type === "error"
                  ? "border-danger/30 bg-danger-soft text-danger"
                  : "border-success/30 bg-success-soft text-success-strong",
              )}
            >
              <div className="flex items-center gap-2">
                <span>{gpsMessage.type === "error" ? "⚠️" : "✓"}</span>
                <span>{gpsMessage.text}</span>
              </div>
              {draft.lat != null && draft.lng != null && (
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${draft.lat},${draft.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold underline text-brand-700 hover:text-brand-800"
                  >
                    Preview Map ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      update({ lat: null, lng: null });
                      setGpsMessage(null);
                    }}
                    className="text-xs text-ink-muted hover:text-danger underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Coordinates preview pill if location is stored and no active alert */}
          {!gpsMessage && draft.lat != null && draft.lng != null && (
            <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success-soft px-3.5 py-2 text-xs text-success-strong">
              <span className="flex items-center gap-1.5 font-medium">
                <span>📍</span>
                <span>
                  GPS location saved: {draft.lat.toFixed(4)}, {draft.lng.toFixed(4)}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${draft.lat},${draft.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-brand-700"
                >
                  Preview on Maps ↗
                </a>
                <button
                  type="button"
                  onClick={() => update({ lat: null, lng: null })}
                  className="text-ink-muted hover:text-danger underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="State *"
              placeholder={loadingStates ? "Loading states…" : "Select State"}
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
              label="District *"
              placeholder={
                !draft.stateCode
                  ? "Choose state first"
                  : loadingDistricts
                    ? "Loading…"
                    : "Select District"
              }
              options={districts.map((d) => ({
                value: d.slug,
                label: d.name,
              }))}
              value={draft.districtSlug ?? ""}
              disabled={
                !draft.stateCode || loadingDistricts || districts.length === 0
              }
              onChange={(e) =>
                update({
                  districtSlug: e.target.value,
                  citySlug: e.target.value,
                  localitySlug: null,
                })
              }
            />

            <Select
              label="City / Locality *"
              placeholder={
                !draft.districtSlug
                  ? "Choose district first"
                  : loadingCities
                    ? "Loading…"
                    : "Select Locality"
              }
              options={cities.map((c) => ({ value: c.slug, label: c.name }))}
              value={draft.localitySlug ?? ""}
              disabled={
                !draft.districtSlug || loadingCities || cities.length === 0
              }
              onChange={(e) => update({ localitySlug: e.target.value })}
            />
          </div>

          <Input
            label="Street Address / Landmark (Optional)"
            placeholder="e.g. Near HSR BDA Complex, Sector 2"
            hint="Exact house number is never shared publicly. We only show the approximate neighborhood."
            value={draft.addressLine}
            onChange={(e) => update({ addressLine: e.target.value })}
          />
        </section>

        {/* =========================================================================
            SECTION 5: UPLOAD PHOTOS (MIN 1 REQUIRED)
            ========================================================================= */}
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                5
              </span>
              Upload Photos <span className="text-danger">*</span>
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Add at least 1 photo. Listings with 3+ clear photos get up to 5x more chats.
            </p>
          </div>

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

          {/* Upload Dropzone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={totalFiles >= MAX_FILES}
            className={cn(
              "group flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer",
              totalFiles >= MAX_FILES
                ? "border-line bg-surface-muted opacity-60 cursor-not-allowed"
                : "border-brand-200 bg-brand-50/40 hover:border-brand-400 hover:bg-brand-50",
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-xs text-brand-600 transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink group-hover:text-brand-700 transition-colors">
                {totalFiles >= MAX_FILES
                  ? "Maximum 12 photos reached"
                  : "Click or drag to upload room photos"}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                JPG, PNG, WebP · Up to 12 files · First photo is cover
              </p>
            </div>
          </button>

          {/* Preview Thumbnails */}
          {totalFiles > 0 && (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 pt-2">
              {draft.media.map((item, idx) => (
                <div
                  key={item.publicId}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-sunken shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.secureUrl}
                    alt=""
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {idx === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      Cover
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeMedia(item.publicId)}
                    aria-label={`Remove photo ${idx + 1}`}
                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-colors hover:bg-danger cursor-pointer shadow-xs"
                  >
                    ×
                  </button>
                </div>
              ))}

              {pending.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-brand-300 bg-brand-50/50 flex flex-col items-center justify-center p-2 text-center"
                >
                  {item.error ? (
                    <div className="text-[10px] text-danger font-medium leading-tight">
                      <p>Failed</p>
                      <button
                        type="button"
                        onClick={() =>
                          setPending((curr) =>
                            curr.filter((p) => p.id !== item.id),
                          )
                        }
                        className="underline text-ink-muted mt-1"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-brand-700">
                        {item.percent}%
                      </span>
                      <div className="mt-1 h-1.5 w-full max-w-[80%] overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full bg-brand-600 transition-all duration-200"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 6: AMENITIES & ROOM SPECS (OPTIONAL / COMPRESSED)
            ========================================================================= */}
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-surface-sunken text-xs font-bold text-ink-muted">
                6
              </span>
              Room Details &amp; Amenities (Optional)
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Fill in extra details to help seekers find your room in filtered searches.
            </p>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Furnishing
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(furnishingLabels) as Furnishing[]).map((val) => {
                const active = (draft.furnishing || "unfurnished") === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update({ furnishing: val })}
                    className={cn(
                      "rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                      active
                        ? "border-brand-600 bg-brand-50 text-brand-700 font-bold"
                        : "border-line bg-surface text-ink hover:bg-surface-muted",
                    )}
                  >
                    {furnishingLabels[val]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Tenant */}
          <div className="border-t border-line/60 pt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Suitable For / Preferred Tenant
            </label>
            <div className="flex flex-wrap gap-2">
              {TENANT_OPTIONS.map((val) => {
                const active = draft.preferredTenant.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleTenantPreference(val)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer",
                      active
                        ? "border-brand-600 bg-brand-50 text-brand-700 font-semibold"
                        : "border-line bg-surface text-ink-muted hover:text-ink hover:bg-surface-muted",
                    )}
                  >
                    {tenantPreferenceLabels[val]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Amenities */}
          {amenities.length > 0 && (
            <div className="border-t border-line/60 pt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2.5">
                Key Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => {
                  const selected = draft.amenitySlugs.includes(amenity.slug);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.slug)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer",
                        selected
                          ? "border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-2xs"
                          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
                      )}
                    >
                      {selected ? "✓ " : "+ "}
                      {amenity.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 7: ERROR BANNER & POST AD BUTTON
            ========================================================================= */}
        {submittedAttempt && !isReady && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft p-4 sm:p-5">
            <h3 className="text-sm font-bold text-danger">
              Please complete required fields before posting:
            </h3>
            <ul className="mt-2 list-inside list-disc text-xs sm:text-sm text-danger space-y-1">
              {missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-danger/30 bg-danger-soft p-4 sm:p-5 text-sm text-danger font-medium"
          >
            {error}
          </div>
        )}

        {/* Sticky Action Footer */}
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-6 shadow-raised flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-ink">
              Ready to publish your ad?
            </p>
            <p className="text-xs text-ink-muted">
              By posting, you agree to RoomBazar&apos;s{" "}
              <Link href={routes.terms} className="underline text-brand-600">
                Terms of Use
              </Link>
              .
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={publishing}
            disabled={publishing || isUploading}
            className="w-full sm:w-auto px-10 py-3.5 text-base font-extrabold shadow-raised bg-brand-600 hover:bg-brand-700"
          >
            {publishing ? "Posting Your Ad…" : "POST AD NOW"}
          </Button>
        </div>
      </form>
    </div>
  );
}
