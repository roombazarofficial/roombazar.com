"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Checkbox } from "@/components/ui/checkbox";
import { useListingDraft } from "@/store/listingdraftstore";
import { amenities } from "@/lib/api/mockdata";
import { tenantPreferenceLabels } from "@/lib/constants/tenantpreferences";
import { cn } from "@/lib/utils/classnames";
import type { TenantPreference } from "@/types/listing";

/**
 * Tenant preference is a fixed list, never a text box.
 *
 * Free-text preferences in this market routinely encode caste and religion
 * filters. A closed set makes that impossible to express in structured data,
 * and the description field is scanned separately. The reasoning is in
 * docs/03-trust-and-safety.md — this is a deliberate product position, not an
 * incomplete form.
 */
const options: TenantPreference[] = [
  "any",
  "family",
  "workingprofessional",
  "student",
  "bachelormale",
  "bachelorfemale",
];

export default function Page() {
  const { draft, update, toggleAmenity } = useListingDraft();

  function togglePreference(value: TenantPreference) {
    // "Any" is exclusive — selecting it clears the rest, and selecting
    // anything else clears "any".
    if (value === "any") {
      update({ preferredTenant: draft.preferredTenant.includes("any") ? [] : ["any"] });
      return;
    }

    const withoutAny = draft.preferredTenant.filter((item) => item !== "any");

    update({
      preferredTenant: withoutAny.includes(value)
        ? withoutAny.filter((item) => item !== value)
        : [...withoutAny, value],
    });
  }

  return (
    <StepShell
      step="rules"
      title="House rules and preferences"
      description="All optional. Leave anything blank that does not apply."
    >
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Who is this room suitable for?
        </legend>

        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => togglePreference(value)}
              aria-pressed={draft.preferredTenant.includes(value)}
              className={cn(
                "rounded-control border px-3 py-2.5 text-sm transition-colors",
                draft.preferredTenant.includes(value)
                  ? "border-brand-600 bg-brand-50 font-medium text-brand-700"
                  : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
              )}
            >
              {tenantPreferenceLabels[value]}
            </button>
          ))}
        </div>

        <p className="mt-2.5 text-xs text-ink-muted">
          Listings that restrict tenants by caste, religion or region are
          removed. Gender preference is available for shared homes and PGs,
          where other residents are affected.
        </p>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-ink">
          House rules
        </legend>
        <div className="grid sm:grid-cols-2">
          {amenities
            .filter((amenity) => amenity.category === "rules")
            .map((amenity) => (
              <Checkbox
                key={amenity.id}
                label={amenity.label}
                checked={draft.amenitySlugs.includes(amenity.slug)}
                onChange={() => toggleAmenity(amenity.slug)}
              />
            ))}
        </div>
      </fieldset>
    </StepShell>
  );
}
