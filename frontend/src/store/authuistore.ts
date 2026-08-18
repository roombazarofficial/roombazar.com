import { create } from "zustand";
import type { CurrentUser } from "@/types/user";

interface AuthUiStore {
  open: boolean;
  intent: string | null;
  nextPath: string | null;

  /** Null while unknown, so the header can hold its shape until resolved. */
  user: CurrentUser | null;
  loaded: boolean;

  openSignIn: (options?: { intent?: string; next?: string }) => void;
  closeSignIn: () => void;
  setUser: (user: CurrentUser | null) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useAuthUi = create<AuthUiStore>((set) => ({
  open: false,
  intent: null,
  nextPath: null,
  user: null,
  loaded: false,

  openSignIn: (options) =>
    set({
      open: true,
      intent: options?.intent ?? null,
      nextPath: options?.next ?? null,
    }),

  closeSignIn: () => set({ open: false, intent: null }),
  setUser: (user) => set({ user, loaded: true }),
  setLoaded: (loaded) => set({ loaded }),
}));
