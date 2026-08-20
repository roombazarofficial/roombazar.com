"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useIndiaLocations } from "@/hooks/useindialocations";
import { useListingDraft } from "@/store/listingdraftstore";

export default function Page() {
  const { draft, update } = useListingDraft();
  const {
    states,
    districts,
    cities,
    loadingStates,
    loadingDistricts,
    loadingCities,
    error,
    retry,
  } = useIndiaLocations(draft.stateCode, draft.districtSlug);

  const statePlaceholder = loadingStates
    ? "Loading states..."
    : states.length === 0
      ? "No states available"
      : "Select a state";

  const districtPlaceholder = !draft.stateCode
    ? "Choose a state first"
    : loadingDistricts
      ? "Loading districts..."
      : districts.length === 0
        ? "No districts available"
        : "Select a district";

  const cityPlaceholder = !draft.districtSlug
    ? "Choose a district first"
    : loadingCities
      ? "Loading cities..."
      : cities.length === 0
        ? "No cities available"
        : "Select a city";

  return (
    <StepShell
      step="location"
      title="Where is the room?"
      description="Choose the state, district and city so seekers can find your room."
      canContinue={Boolean(
        draft.stateCode && draft.districtSlug && draft.localitySlug,
      )}
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
        label="State"
        placeholder={statePlaceholder}
        options={states.map((state) => ({
          value: state.code,
          label: state.name,
        }))}
        value={draft.stateCode ?? ""}
        disabled={loadingStates || states.length === 0}
        onChange={(event) =>
          update({
            stateCode: event.target.value,
            districtSlug: null,
            citySlug: null,
            localitySlug: null,
          })
        }
      />

      <Select
        label="District"
        placeholder={districtPlaceholder}
        options={districts.map((district) => ({
          value: district.slug,
          label: district.name,
        }))}
        value={draft.districtSlug ?? ""}
        disabled={
          !draft.stateCode || loadingDistricts || districts.length === 0
        }
        onChange={(event) =>
          update({
            districtSlug: event.target.value,
            citySlug: event.target.value,
            localitySlug: null,
          })
        }
      />

      <Select
        label="City"
        placeholder={cityPlaceholder}
        options={cities.map((city) => ({
          value: city.slug,
          label: city.name,
        }))}
        value={draft.localitySlug ?? ""}
        disabled={
          !draft.districtSlug || loadingCities || cities.length === 0
        }
        onChange={(event) => update({ localitySlug: event.target.value })}
        hint="Includes cities, towns and local areas covered by India Post."
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
