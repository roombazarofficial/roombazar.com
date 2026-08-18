"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useListingDraft } from "@/store/listingdraftstore";
import { useLocalities } from "@/hooks/uselocalities";

export default function Page() {
  const { draft, update } = useListingDraft();
  const {
    localities,
    cities,
    loadingCities,
    loadingLocalities,
    error,
    retry,
  } = useLocalities(draft.citySlug);

  const cityPlaceholder = loadingCities
    ? "Loading cities…"
    : cities.length === 0
      ? "No cities available"
      : "Select a city";

  const localityPlaceholder = !draft.citySlug
    ? "Choose a city first"
    : loadingLocalities
      ? "Loading localities…"
      : localities.length === 0
        ? "No localities available"
        : "Select a locality";

  return (
    <StepShell
      step="location"
      title="Where is the room?"
      description="Seekers search by locality, so this is the field that decides whether you are found."
      canContinue={Boolean(draft.citySlug && draft.localitySlug)}
    >
      {error && (
        <div
          role="alert"
          className="rounded-card border border-danger/30 bg-danger-soft px-4 py-3"
        >
          <p className="text-sm text-danger">{error}</p>

          <button
            type="button"
            onClick={retry}
            className="mt-1 text-sm font-medium text-danger underline"
          >
            Try again
          </button>
        </div>
      )}

      <Select
        label="City"
        placeholder={cityPlaceholder}
        options={cities.map((city) => ({ value: city.slug, label: city.name }))}
        value={draft.citySlug ?? ""}
        disabled={loadingCities || cities.length === 0}
        /*
          Changing the city clears the locality, because the previous choice
          belongs to a different city and would otherwise be submitted as
          though it were valid here.
        */
        onChange={(event) =>
          update({ citySlug: event.target.value, localitySlug: null })
        }
      />

      <Select
        label="Locality"
        placeholder={localityPlaceholder}
        options={localities.map((locality) => ({
          value: locality.slug,
          label: locality.name,
        }))}
        value={draft.localitySlug ?? ""}
        disabled={
          !draft.citySlug || loadingLocalities || localities.length === 0
        }
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
