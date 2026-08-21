"use client";

import { useEffect } from "react";
import { useAuthUi } from "@/store/authuistore";
import { useSavedStore } from "@/store/savedstore";
import { fetchCurrentUser } from "@/lib/api/auth";

/**
 * Resolves the current session once on mount and keeps it in the store.
 *
 * The session cookie is httpOnly, so the browser cannot read it directly —
 * asking the API who it thinks we are is the only way to know.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthUi((state) => state.setUser);

  useEffect(() => {
    let active = true;

    fetchCurrentUser().then((user) => {
      if (active) {
        setUser(user);
        if (user) {
          useSavedStore.getState().fetchSavedIds();
        } else {
          useSavedStore.getState().reset();
        }
      }
    });

    return () => {
      active = false;
    };
  }, [setUser]);

  return <>{children}</>;
}
