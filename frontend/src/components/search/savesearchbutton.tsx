"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { SearchFilters } from "@/types/searchfilters";

/**
 * Saved searches are the main retention loop — a seeker who saves one and
 * gets a matching room the next morning comes back with no paid acquisition
 * behind it. Offering it at the moment someone has just built a filter set is
 * the only time they will care. See docs/01-data-model.md.
 */
export function SaveSearchButton({ filters }: { filters: SearchFilters }) {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState("daily");
  const [saved, setSaved] = useState(false);

  const hasFilters =
    filters.localitySlugs.length > 0 ||
    filters.roomTypes.length > 0 ||
    filters.postedBy.length > 0 ||
    filters.minRentPaise != null ||
    filters.maxRentPaise != null;

  // Saving an unfiltered city search is just "tell me about every new room",
  // which is a notification nobody keeps switched on for long.
  if (!hasFilters) return null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Save this search
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={saved ? "Search saved" : "Save this search"}
        description={
          saved
            ? "We will let you know when a new room matches. You can change or delete it from your dashboard."
            : "We will tell you when a new room matches these filters."
        }
        footer={
          saved ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setSaved(true)}>Save search</Button>
            </>
          )
        }
      >
        {!saved && (
          <Select
            label="How often should we tell you?"
            options={[
              { value: "instant", label: "As soon as a room matches" },
              { value: "daily", label: "Once a day" },
              { value: "off", label: "Do not notify me" },
            ]}
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
          />
        )}
      </Modal>
    </>
  );
}
