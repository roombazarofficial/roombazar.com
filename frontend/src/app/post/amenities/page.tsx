"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useListingDraft } from "@/store/listingdraftstore";
import { useAmenities } from "@/hooks/useamenities";
import { furnishingLabels } from "@/lib/constants/roomtypes";
import type { AmenityCategory } from "@/types/amenity";
import type { Furnishing } from "@/types/listing";

const groups: { category: AmenityCategory; heading: string }[] = [
  { category: "utilities", heading: "Utilities" },
  { category: "convenience", heading: "Convenience" },
  { category: "safety", heading: "Safety" },
];

export default function Page() {
  const { draft, update, toggleAmenity } = useListingDraft();
  const amenities = useAmenities();

  return (
    <StepShell
      step="amenities"
      title="What does the room have?"
      description="Optional, but listings with amenities filled in get noticeably more enquiries."
    >
      <Select
        label="Furnishing"
        placeholder="Select furnishing"
        options={(Object.keys(furnishingLabels) as Furnishing[]).map((value) => ({
          value,
          label: furnishingLabels[value],
        }))}
        value={draft.furnishing ?? ""}
        onChange={(event) =>
          update({ furnishing: event.target.value as Furnishing })
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Area (sq ft)"
          type="number"
          inputMode="numeric"
          value={draft.areaSqft ?? ""}
          onChange={(event) =>
            update({ areaSqft: event.target.value ? Number(event.target.value) : null })
          }
        />

        <Input
          label="Floor"
          type="number"
          inputMode="numeric"
          value={draft.floor ?? ""}
          onChange={(event) =>
            update({ floor: event.target.value ? Number(event.target.value) : null })
          }
        />

        <Input
          label="Total floors"
          type="number"
          inputMode="numeric"
          value={draft.totalFloors ?? ""}
          onChange={(event) =>
            update({
              totalFloors: event.target.value ? Number(event.target.value) : null,
            })
          }
        />

      </div>

      {groups.map((group) => (
        <fieldset key={group.category}>
          <legend className="mb-1 text-sm font-medium text-ink">
            {group.heading}
          </legend>

          <div className="grid sm:grid-cols-2">
            {amenities
              .filter((amenity) => amenity.category === group.category)
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

      ))}
    </StepShell>

  );
}
