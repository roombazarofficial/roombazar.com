"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useListingDraft } from "@/store/listingdraftstore";

export default function Page() {
  const { draft, update } = useListingDraft();

  const depositMonths =
    draft.rentRupees && draft.depositRupees
      ? (draft.depositRupees / draft.rentRupees).toFixed(1).replace(/\.0$/, "")
      : null;

  return (
    <StepShell
      step="pricing"
      title="Rent and deposit"
      description="Be accurate. Listings priced well below the area average get flagged for review."
      canContinue={Boolean(draft.rentRupees)}
    >
      <Input
        label="Monthly rent"
        type="number"
        inputMode="numeric"
        prefix="₹"
        suffix="/month"
        placeholder="15000"
        value={draft.rentRupees ?? ""}
        onChange={(event) =>
          update({ rentRupees: event.target.value ? Number(event.target.value) : null })
        }
      />

      <Input
        label="Security deposit"
        type="number"
        inputMode="numeric"
        prefix="₹"
        placeholder="30000"
        hint={depositMonths ? `That is ${depositMonths} months of rent.` : undefined}
        value={draft.depositRupees ?? ""}
        onChange={(event) =>
          update({ depositRupees: event.target.value ? Number(event.target.value) : null })
        }
      />

      <Input
        label="Maintenance (optional)"
        type="number"
        inputMode="numeric"
        prefix="₹"
        suffix="/month"
        hint="Leave blank if maintenance is included in the rent."
        value={draft.maintenanceRupees ?? ""}
        onChange={(event) =>
          update({
            maintenanceRupees: event.target.value ? Number(event.target.value) : null,
          })
        }
      />

      <div className="space-y-0.5">
        <Checkbox
          label="Electricity and water included in rent"
          checked={draft.billsIncluded}
          onChange={(event) => update({ billsIncluded: event.target.checked })}
        />
        <Checkbox
          label="Rent is negotiable"
          checked={draft.negotiable}
          onChange={(event) => update({ negotiable: event.target.checked })}
        />
      </div>
    </StepShell>
  );
}
