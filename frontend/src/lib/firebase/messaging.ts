"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging";
import {
  firebaseConfig,
  isFirebaseConfigured,
  serviceWorkerUrl,
  vapidKey,
} from "./config";

function app(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

class TimeoutError extends Error {}

/** Rejects with TimeoutError after `ms` so a hung SDK call can't spin forever. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(`${label} timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

/** Synchronous capability check — never touches storage, so it cannot hang. */
export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Returns a Messaging instance, or null. No module-level caching of a pending
 * promise (a hung attempt used to poison every later call).
 */
function messagingOrNull(): Messaging | null {
  if (!isFirebaseConfigured) {
    console.warn(
      "[push] Firebase not configured — NEXT_PUBLIC_FIREBASE_* missing or incomplete",
    );
    return null;
  }
  if (!pushSupported()) {
    console.warn("[push] this browser does not support web push");
    return null;
  }
  try {
    return getMessaging(app());
  } catch (error) {
    console.error("[push] getMessaging failed", error);
    return null;
  }
}

export async function getMessagingIfSupported(): Promise<Messaging | null> {
  return messagingOrNull();
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await withTimeout(
      navigator.serviceWorker.register(serviceWorkerUrl(), { scope: "/" }),
      15000,
      "serviceWorker.register",
    );
    try {
      await withTimeout(
        navigator.serviceWorker.ready,
        10000,
        "serviceWorker.ready",
      );
    } catch (error) {
      console.warn("[push] SW not 'ready' yet, continuing anyway", error);
    }
    return reg;
  } catch (error) {
    console.error("[push] service worker registration failed", error);
    return null;
  }
}

export type PermissionState = NotificationPermission | "unsupported";

export function currentPermission(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export interface TokenResult {
  token: string;
  browser: string;
}

function browserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Web";
}

async function fetchToken(
  messaging: Messaging,
  registration: ServiceWorkerRegistration,
): Promise<string | null> {
  try {
    const token = await withTimeout(
      getToken(messaging, { vapidKey, serviceWorkerRegistration: registration }),
      20000,
      "getToken",
    );
    if (!token) {
      console.warn("[push] getToken returned empty — check the VAPID key");
      return null;
    }
    return token;
  } catch (error) {
    console.error(
      "[push] getToken failed — likely a wrong VAPID key, a service-worker error, " +
        "or the browser blocking storage (Edge Tracking Prevention / private window)",
      error,
    );
    return null;
  }
}

/**
 * Asks for permission (call from a user gesture) and returns the FCM token.
 * Always resolves — never hangs — thanks to the timeouts above.
 */
export async function requestPermissionAndToken(): Promise<TokenResult | null> {
  console.info("[push] step 1: checking support…");
  const messaging = messagingOrNull();
  if (!messaging) return null;

  console.info("[push] step 2: requesting browser permission…");
  let permission: NotificationPermission;
  try {
    permission = await withTimeout(
      Notification.requestPermission(),
      120000,
      "Notification.requestPermission",
    );
  } catch (error) {
    console.error("[push] requestPermission hung or failed", error);
    return null;
  }
  console.info("[push] permission =", permission);
  if (permission !== "granted") return null;

  console.info("[push] step 3: registering service worker…");
  const registration = await registerServiceWorker();
  if (!registration) return null;

  console.info("[push] step 4: fetching FCM token…");
  const token = await fetchToken(messaging, registration);
  if (token) console.info("[push] got token:", token.slice(0, 16) + "…");
  return token ? { token, browser: browserName() } : null;
}

export async function getExistingToken(): Promise<TokenResult | null> {
  if (currentPermission() !== "granted") return null;
  const messaging = messagingOrNull();
  if (!messaging) return null;

  const registration = await registerServiceWorker();
  if (!registration) return null;

  const token = await fetchToken(messaging, registration);
  return token ? { token, browser: browserName() } : null;
}

export async function revokeToken(): Promise<void> {
  const messaging = messagingOrNull();
  if (!messaging) return;
  try {
    await deleteToken(messaging);
  } catch {
    /* already gone */
  }
}

export async function onForegroundMessage(
  handler: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = messagingOrNull();
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
}
