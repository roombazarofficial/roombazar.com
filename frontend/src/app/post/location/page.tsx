"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useListingDraft } from "@/store/listingdraftstore";
import { localities } from "@/lib/api/mockdata";

export default function Page() {
  const { draft, update } = useListingDraft();

  return (
    <StepShell
      step="location"
      title="Where is the room?"
      description="Seekers search by locality, so this is the field that decides whether you are found."
      canContinue={Boolean(draft.localitySlug)}
    >
      <Select
        label="City"
        options={[{ value: "bengaluru", label: "Bengaluru" }]}
        value={draft.citySlug ?? ""}
        onChange={(event) => update({ citySlug: event.target.value })}
      />

      {/*
        Picked from a list, never typed free-form. Free-text localities
        fragment search ("Indiranagar" / "Indira Nagar") and both sides of the
        market stop finding each other. See docs/01-data-model.md.
      */}
      <Select
        label="Locality"
        placeholder="Select a locality"
        options={localities.map((locality) => ({
          value: locality.slug,
          label: locality.name,
        }))}
        value={draft.localitySlug ?? ""}
        onChange={(event) => update({ localitySlug: event.target.value })}
        hint="Cannot find yours? Ask us to add it from the help page."
      />

      <Input
        label="Address (optional)"
        placeholder="House number, street, landmark"
        hint="Never shown publicly. Used only to place the map circle and to verify the listing."
        value={draft.addressLine}
        onChange={(event) => update({ addressLine: event.target.value })}
      />

      <aside className="rounded-card border border-line bg-surface-muted p-4">
        <p className="text-sm text-ink-muted">
          Your exact address is never published. Seekers see an approximate
          circle around the area until you both agree to share contact details.
        </p>
      </aside>
    </StepShell>
  );
}
