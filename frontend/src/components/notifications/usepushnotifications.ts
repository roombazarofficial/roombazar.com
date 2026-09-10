"use client";

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  currentPermission,
  getExistingToken,
  requestPermissionAndToken,
  revokeToken,
  type PermissionState,
} from "@/lib/firebase/messaging";
import { registerPushToken, unregisterToken } from "@/lib/api/notifications";

const DISMISS_KEY = "rb_notif_prompt_dismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export interface PushState {
  /** Firebase env vars present and browser supports web push. */
  available: boolean;
  permission: PermissionState;
  /** A token is registered with the backend for this browser. */
  registered: boolean;
  busy: boolean;
  /** Show the soft prompt card: available, not decided, not dismissed. */
  showPrompt: boolean;
  enable: () => Promise<boolean>;
  disable: () => Promise<void>;
  dismissPrompt: () => void;
}

/**
 * Owns web-push state for the signed-in user's current browser.
 *
 * Never requests permission on load. If permission was already granted (e.g.
 * on a previous visit) the device is silently re-registered so a rotated token
 * stays current.
 */
export function usePushNotifications(enabled: boolean): PushState {
  const [permission, setPermission] = useState<PermissionState>("unsupported");
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  const available =
    isFirebaseConfigured &&
    permission !== "unsupported" &&
    typeof window !== "undefined";

  useEffect(() => {
    setPermission(currentPermission());
    setDismissed(readDismissed());
  }, []);

  useEffect(() => {
    if (!enabled || !isFirebaseConfigured) return;
    if (currentPermission() !== "granted") return;

    let active = true;
    void getExistingToken().then((result) => {
      if (!active || !result) return;
      registerPushToken({ token: result.token, browser: result.browser })
        .then(() => active && setRegistered(true))
        .catch(() => undefined);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  const enable = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    // Hard ceiling: whatever happens, the button stops spinning within 45s.
    const safety = setTimeout(() => {
      console.error("[push] enable() still running after 45s — giving up");
      setBusy(false);
    }, 45000);
    try {
      const result = await requestPermissionAndToken();
      setPermission(currentPermission());
      if (!result) return false;
      await registerPushToken({ token: result.token, browser: result.browser });
      console.info("[push] device registered with backend ✓");
      setRegistered(true);
      return true;
    } catch (error) {
      console.error("[push] enable() failed", error);
      return false;
    } finally {
      clearTimeout(safety);
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async (): Promise<void> => {
    setBusy(true);
    try {
      const existing = await getExistingToken();
      if (existing) await unregisterToken(existing.token);
      await revokeToken();
      setRegistered(false);
    } finally {
      setBusy(false);
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — fine, prompt just reappears next visit */
    }
    setDismissed(true);
  }, []);

  const showPrompt =
    enabled &&
    available &&
    permission === "default" &&
    !dismissed &&
    !registered;

  return {
    available,
    permission,
    registered,
    busy,
    showPrompt,
    enable,
    disable,
    dismissPrompt,
  };
}
