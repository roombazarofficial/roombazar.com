"use client";

import { useEffect, useRef, useState } from "react";
import { getDraft, saveDraft } from "@/lib/api/listingdraft";
import { useListingDraft, type ListingDraft } from "@/store/listingdraftstore";

const SAVE_DELAY_MS = 800;

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Keeps the wizard draft on the server.
 *
 * The draft used to live in localStorage, which tied it to one browser: a
 * lister who started on a phone could not finish on a laptop, and clearing
 * site data threw the work away.
 */
export function useListingDraftSync(): SaveState {
  const draft = useListingDraft((state) => state.draft);
  const hydrated = useListingDraft((state) => state.hydrated);

  const [saveState, setSaveState] = useState<SaveState>("idle");

  /*
    The draft as the server last confirmed it. Comparing against this stops the
    first post-load render from writing back what was just read.
  */
  const lastSaved = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    getDraft()
      .then((record) => {
        if (!active) return;

        if (record.data) {
          useListingDraft
            .getState()
            .replace(record.data as Partial<ListingDraft>);
        }

        lastSaved.current = JSON.stringify(
          useListingDraft.getState().draft,
        );
      })
      .catch(() => {
        /*
          A failed load must not block the wizard. It does leave lastSaved null,
          so the first edit writes the whole draft and recovers.
        */
      })
      .finally(() => {
        if (active) useListingDraft.getState().setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const serialised = JSON.stringify(draft);
    if (serialised === lastSaved.current) return;

    setSaveState("saving");

    /*
      Debounced, because every keystroke changes the draft and one request per
      character would be both wasteful and out of order.
    */
    const timer = setTimeout(() => {
      saveDraft(draft)
        .then(() => {
          lastSaved.current = serialised;
          setSaveState("saved");
        })
        .catch(() => setSaveState("error"));
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [draft, hydrated]);

  return saveState;
}
