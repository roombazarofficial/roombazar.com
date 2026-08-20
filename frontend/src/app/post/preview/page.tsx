"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepShell } from "@/components/listingform/stepshell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createListing } from "@/lib/api/createlisting";
import { discardDraft } from "@/lib/api/listingdraft";
import { ApiRequestError } from "@/lib/api/client";
import {
  useListingDraft,
  isPublishable,
  missingFields,
  draftToPayload,
} from "@/store/listingdraftstore";
import { roomTypeLabels, furnishingLabels, postedByLabels } from "@/lib/constants/roomtypes";
import { tenantPreferenceLabels } from "@/lib/constants/tenantpreferences";
import { useIndiaLocations } from "@/hooks/useindialocations";
import { routes } from "@/lib/constants/routes";

export default function Page() {
  const router = useRouter();
  const { draft, reset } = useListingDraft();
  const { states, districts, cities } = useIndiaLocations(
    draft.stateCode,
    draft.districtSlug,
  );

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locality = cities.find((item) => item.slug === draft.localitySlug);
  const district = districts.find((item) => item.slug === draft.districtSlug);
  const state = states.find((item) => item.code === draft.stateCode);
  const ready = isPublishable(draft);
  const missing = missingFields(draft);

  async function publish() {
    if (!ready || publishing) return;

    setPublishing(true);
    setError(null);

    try {
      const listing = await createListing(draftToPayload(draft));

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

  return (
    <StepShell
      step="preview"
      title="Check and publish"
      description="This is what seekers will see."
      action={
        <Button
          size="lg"
          onClick={() => void publish()}
          disabled={!ready}
          loading={publishing}
        >
          {publishing ? "Publishing…" : "Publish listing"}
        </Button>
      }
    >
      {!ready && (
        <div className="rounded-card border border-danger/20 bg-danger-soft p-4">
          <p className="text-sm font-medium text-danger">
            Still needed before you can publish
          </p>

          <ul className="mt-1.5 list-inside list-disc text-sm text-danger">
            {missing.map((item) => (
              <li key={item}>{item}</li>

            ))}
          </ul>

        </div>

      )}

      {error && (
        <div
          role="alert"
          className="rounded-card border border-danger/20 bg-danger-soft p-4"
        >
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="rounded-card border border-line bg-surface p-5">
        <div className="flex flex-wrap gap-1.5">
          {draft.postedBy && (
            <Badge tone={draft.postedBy === "agent" ? "neutral" : "success"} dot>
              {postedByLabels[draft.postedBy]}
            </Badge>

          )}
          {draft.roomType && (
            <Badge tone="neutral">{roomTypeLabels[draft.roomType]}</Badge>

          )}
          {draft.furnishing && (
            <Badge tone="neutral">{furnishingLabels[draft.furnishing]}</Badge>

          )}
          {draft.negotiable && <Badge tone="info">Negotiable</Badge>}

        </div>

        <h2 className="mt-3 text-lg font-semibold text-ink">
          {draft.title || generatedTitle(draft.roomType, locality?.name)}
        </h2>

        {locality && (
          <p className="mt-1 text-sm text-ink-muted">
            {[locality.name, district?.name, state?.name]
              .filter(Boolean)
              .join(", ")}
          </p>

        )}

        {draft.rentRupees && (
          <p className="mt-4 text-2xl font-semibold text-ink">
            ₹{draft.rentRupees.toLocaleString("en-IN")}
            <span className="text-base font-normal text-ink-muted">/month</span>
          </p>

        )}

        <dl className="mt-4 space-y-1.5 text-sm">
          {draft.depositRupees && (
            <Row
              label="Deposit"
              value={`₹${draft.depositRupees.toLocaleString("en-IN")}`}
            />

          )}
          <Row
            label="Bills"
            value={draft.billsIncluded ? "Included" : "Billed separately"}
          />

          {draft.media.length > 0 && (
            <Row label="Photos" value={`${draft.media.length} uploaded`} />

          )}
          {draft.amenitySlugs.length > 0 && (
            <Row
              label="Amenities"
              value={`${draft.amenitySlugs.length} selected`}
            />

          )}
          {draft.preferredTenant.length > 0 && (
            <Row
              label="Suitable for"
              value={draft.preferredTenant
                .map((item) => tenantPreferenceLabels[item])
                .join(", ")}
            />

          )}
        </dl>

        {draft.description && (
          <p className="mt-4 whitespace-pre-line border-t border-line pt-4 text-sm text-ink-muted">
            {draft.description}
          </p>

        )}
      </div>

      <p className="text-xs text-ink-muted">
        Your listing will be reviewed before it goes live. By submitting you
        confirm the room is genuinely available and the details are accurate.
        See our{" "}
        <Link href={routes.terms} className="underline hover:text-ink">
          terms
        </Link>

        .
      </p>

    </StepShell>

  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>

      <dd className="text-right text-ink">{value}</dd>

    </div>

  );
}

function generatedTitle(
  roomType: string | null,
  localityName: string | undefined,
): string {
  if (!roomType) return "Your listing";
  const label = roomTypeLabels[roomType as keyof typeof roomTypeLabels];
  return localityName ? `${label} in ${localityName}` : label;
}
