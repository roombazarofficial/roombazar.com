/**
 * Public Firebase Web App configuration, read from NEXT_PUBLIC_* env vars.
 *
 * These values are public by design — they identify the Firebase project to
 * the browser and cannot be used to send notifications or read data on their
 * own. The Admin credentials (private key) live only on the backend.
 *
 * Everything here is optional: if the project is not configured the app keeps
 * working and the notification UI shows an "unavailable" state.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

export const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

export const isFirebaseConfigured =
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.projectId.length > 0 &&
  firebaseConfig.appId.length > 0 &&
  firebaseConfig.messagingSenderId.length > 0 &&
  vapidKey.length > 0;

/**
 * The Firebase messaging service worker needs the same config, but a file in
 * /public is not bundled and cannot read process.env. It is passed as query
 * params on the registration URL instead, so nothing is hard-coded in the file.
 */
export function serviceWorkerUrl(): string {
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}
