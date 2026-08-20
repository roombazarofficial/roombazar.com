"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useListingDraft } from "@/store/listingdraftstore";

export default function Page() {
  const { draft, update } = useListingDraft();

  return (
    <StepShell
      step="availability"
      title="When is it available?"
      description="Almost done. One more screen after this."
    >
      <Input
        label="Available from"
        type="date"
        value={draft.availableFrom ?? ""}
        onChange={(event) => update({ availableFrom: event.target.value || null })}
      />

      <Select
        label="Minimum stay"
        placeholder="No minimum"
        options={[
          { value: "1", label: "1 month" },
          { value: "3", label: "3 months" },
          { value: "6", label: "6 months" },
          { value: "11", label: "11 months" },
        ]}
        value={draft.minStayMonths?.toString() ?? ""}
        onChange={(event) =>
          update({
            minStayMonths: event.target.value ? Number(event.target.value) : null,
          })
        }
      />

      {}
      <aside className="rounded-card border border-line bg-surface-muted p-4">
        <p className="text-sm text-ink-muted">
          Listings stay live for 30 days. We will remind you before it expires,
          and you can renew in one tap — or mark the room taken the moment it
          goes.
        </p>

      </aside>

    </StepShell>

  );
}
