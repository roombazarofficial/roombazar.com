"use client";

import { useEffect } from "react";
import { useAuthUi } from "@/store/authuistore";
import { useSavedStore } from "@/store/savedstore";
import { fetchCurrentUser } from "@/lib/api/auth";
import { chatSocket } from "@/lib/realtime/chat";

/**
 * Resolves the current session once on mount and keeps it in the store.
 *
 * The session cookie is httpOnly, so the browser cannot read it directly —
 * asking the API who it thinks we are is the only way to know.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthUi((state) => state.setUser);
  const user = useAuthUi((state) => state.user);
  const userId = user?.id;

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

  useEffect(() => {
    const socket = chatSocket();

    if (!userId) {
      socket.disconnect();
      return;
    }

    const refreshUser = () => {
      void fetchCurrentUser().then((current) => {
        if (current) setUser(current);
      });
    };

    socket.on("conversation:changed", refreshUser);
    socket.connect();

    return () => {
      socket.off("conversation:changed", refreshUser);
    };
  }, [setUser, userId]);

  return <>{children}</>;
}
