"use client";

import { StepShell } from "@/components/listingform/stepshell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useListingDraft } from "@/store/listingdraftstore";
import { roomTypeLabels, roomTypeOrder, postedByLabels } from "@/lib/constants/roomtypes";
import { cn } from "@/lib/utils/classnames";
import type { PostedBy } from "@/types/listing";

export default function Page() {
  const { draft, update } = useListingDraft();

  return (
    <StepShell
      step="basic-details"
      title="What are you listing?"
      description="Two quick questions, then the details."
      canContinue={Boolean(draft.roomType && draft.postedBy)}
    >
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Type of room
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {roomTypeOrder.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ roomType: type })}
              aria-pressed={draft.roomType === type}
              className={cn(
                "rounded-control border px-3 py-3 text-sm transition-colors",
                draft.roomType === type
                  ? "border-brand-600 bg-brand-50 font-medium text-brand-700"
                  : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
              )}
            >
              {roomTypeLabels[type]}
            </button>
          ))}
        </div>
      </fieldset>

      {/*
        Asked plainly, and early. Brokers are not banned — they are labelled,
        so seekers can filter. Asking this up front, rather than burying it,
        makes an honest answer the path of least resistance.
      */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Who is posting this room?
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(postedByLabels) as PostedBy[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ postedBy: value })}
              aria-pressed={draft.postedBy === value}
              className={cn(
                "rounded-control border px-3 py-3 text-sm transition-colors",
                draft.postedBy === value
                  ? "border-brand-600 bg-brand-50 font-medium text-brand-700"
                  : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
              )}
            >
              {postedByLabels[value]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Seekers can filter for owner-listed rooms. Misrepresenting this gets
          listings removed.
        </p>
      </fieldset>

      <Input
        label="Title (optional)"
        placeholder="Single room with attached bathroom, 5th Block"
        hint="Leave this blank and we will build one from your details."
        value={draft.title}
        onChange={(event) => update({ title: event.target.value })}
      />

      <Textarea
        label="Description (optional)"
        placeholder="Tell seekers about the room, the building, and the neighbourhood."
        maxLength={1500}
        showCount
        value={draft.description}
        onChange={(event) => update({ description: event.target.value })}
      />
    </StepShell>
  );
}
