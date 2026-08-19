"use client";

import { useState, useEffect, useRef } from "react";
import type { Locality } from "@/types/locality";

interface LocationItem {
  id: string;
  name: string;
  subtext?: string;
  type: "all-india" | "city" | "locality";
  slug?: string;
  citySlug?: string;
}

const defaultPopularLocations: LocationItem[] = [
  { id: "city-bom", name: "Mumbai", subtext: "Maharashtra", type: "city", citySlug: "mumbai" },
  { id: "city-hyd", name: "Hyderabad", subtext: "Telangana", type: "city", citySlug: "hyderabad" },
  { id: "city-blr", name: "Bengaluru", subtext: "Karnataka", type: "city", citySlug: "bengaluru" },
];

const lucknowLocalities: LocationItem[] = [
  { id: "lko-gomti", name: "Gomti Nagar", subtext: "Lucknow", type: "locality", slug: "gomti-nagar", citySlug: "lucknow" },
  { id: "lko-semra", name: "Semra", subtext: "Lucknow", type: "locality", slug: "semra", citySlug: "lucknow" },
  { id: "lko-hazrat", name: "Hazratganj", subtext: "Lucknow", type: "locality", slug: "hazratganj", citySlug: "lucknow" },
  { id: "lko-indira", name: "Indira Nagar", subtext: "Lucknow", type: "locality", slug: "indira-nagar", citySlug: "lucknow" },
  { id: "lko-aliganj", name: "Aliganj", subtext: "Lucknow", type: "locality", slug: "aliganj", citySlug: "lucknow" },
];

export function LocationPicker({
  selectedLabel,
  onSelect,
  localities,
}: {
  selectedLabel: string;
  onSelect: (item: { label: string; localitySlug?: string; citySlug?: string }) => void;
  localities: Locality[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "success" | "blocked">("idle");
  const [geoMessage, setGeoMessage] = useState<string>("Location blocked.Check browser/phone settings.");
  const [isLocationOn, setIsLocationOn] = useState<boolean>(false);
  const [detectedCityName, setDetectedCityName] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Request browser geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("blocked");
      setGeoMessage("Location blocked.Check browser/phone settings.");
      setIsLocationOn(false);
      return;
    }

    setGeoStatus("loading");
    setGeoMessage("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode via OpenStreetMap
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await response.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.suburb ||
            data.address?.state ||
            "Lucknow";
          const state = data.address?.state || "Uttar Pradesh";

          const formattedLabel = `${city}, ${state}`;
          setDetectedCityName(city);
          setIsLocationOn(true);
          setGeoStatus("success");
          setGeoMessage(formattedLabel);

          onSelect({
            label: formattedLabel,
            citySlug: city.toLowerCase().replace(/\s+/g, "-"),
          });
          setIsOpen(false);
        } catch {
          // Fallback detected city
          setDetectedCityName("Lucknow");
          setIsLocationOn(true);
          setGeoStatus("success");
          setGeoMessage("Lucknow, Uttar Pradesh");
          onSelect({ label: "Lucknow, Uttar Pradesh", citySlug: "lucknow" });
          setIsOpen(false);
        }
      },
      (error) => {
        setGeoStatus("blocked");
        setIsLocationOn(false);
        setGeoMessage("Location blocked.Check browser/phone settings.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // If location is ON, show detected city's localities (e.g. Gomti Nagar, Semra)
  // If location is NOT ON, show Mumbai, Hyderabad, Bengaluru
  const popularList: LocationItem[] = isLocationOn
    ? (detectedCityName?.toLowerCase().includes("lucknow") ? lucknowLocalities : localities.map((l) => ({
        id: l.id,
        name: l.name,
        subtext: "Bengaluru",
        type: "locality" as const,
        slug: l.slug,
        citySlug: l.citySlug,
      })))
    : defaultPopularLocations;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button with Location Pin & Text */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-5 w-full items-center justify-between gap-2 text-left outline-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0 text-brand-600"
          >
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
          </svg>
          <span className={selectedLabel ? "truncate text-sm font-semibold text-ink leading-none" : "truncate text-sm font-normal text-ink-muted leading-none"}>
            {selectedLabel || "Select location"}
          </span>
        </div>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`size-4 text-ink-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Floating Dropdown Modal Box matching location box width exactly */}
      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-3.5 w-full min-w-full rounded-2xl border border-line bg-white py-3 text-left shadow-2xl ring-1 ring-black/5 scrollbar-thin">
          {/* Action 1: Use Current Location */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex w-full items-center gap-3.5 px-4 py-2.5 text-left transition-colors hover:bg-brand-50"
          >
            {/* Brand Crosshair Target Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D13421"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5 shrink-0 text-brand-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="22" x2="18" y1="12" y2="12" />
              <line x1="6" x2="2" y1="12" y2="12" />
              <line x1="12" x2="12" y1="6" y2="2" />
              <line x1="12" x2="12" y1="22" y2="18" />
              <circle cx="12" cy="12" r="2.5" fill="#D13421" />
            </svg>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand-600">
                {geoStatus === "loading" ? "Detecting location..." : "Use current location"}
              </p>
            </div>
          </button>

          <hr className="my-2 border-line/80" />

          {/* Section: RECENT LOCATIONS */}
          <div className="px-4 py-1">
            <p className="text-2xs font-bold uppercase tracking-wider text-[#6B7280]">
              RECENT LOCATIONS
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelect({ label: "India" });
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3.5 px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5 shrink-0 text-gray-500"
            >
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
            </svg>
            <span className="text-sm font-medium text-ink">India</span>
          </button>

          <hr className="my-2 border-line/80" />

          {/* Section: POPULAR LOCATIONS */}
          <div className="px-4 py-1">
            <p className="text-2xs font-bold uppercase tracking-wider text-[#6B7280]">
              POPULAR LOCATIONS
            </p>
          </div>

          <div>
            {popularList.slice(0, 2).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect({
                    label: item.subtext ? `${item.name}, ${item.subtext}` : item.name,
                    localitySlug: item.slug,
                    citySlug: item.citySlug,
                  });
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3.5 px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 shrink-0 text-gray-500"
                >
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                </svg>
                <div className="truncate">
                  <span className="text-sm font-medium text-ink">{item.name}</span>
                  {item.subtext && (
                    <span className="ml-1.5 text-xs text-ink-muted font-normal">
                      · {item.subtext}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
