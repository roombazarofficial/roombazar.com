/* eslint-disable no-undef */
/**
 * RoomBazar Firebase Cloud Messaging service worker.
 *
 * Handles background push messages: shows the notification, and on click
 * focuses an existing RoomBazar tab or opens a new one at the deep link.
 *
 * The Firebase config is NOT hard-coded here. It is passed as query params on
 * the registration URL (see src/lib/firebase/config.ts -> serviceWorkerUrl).
 * Only the public Web App config ever reaches this file; the Admin private key
 * is backend-only.
 */
importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js",
);

const params = new URL(self.location).searchParams;

const firebaseConfig = {
  apiKey: params.get("apiKey") || "",
  authDomain: params.get("authDomain") || "",
  projectId: params.get("projectId") || "",
  storageBucket: params.get("storageBucket") || "",
  messagingSenderId: params.get("messagingSenderId") || "",
  appId: params.get("appId") || "",
};

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

let messaging = null;

if (firebaseConfig.projectId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const title =
      (payload.notification && payload.notification.title) ||
      data.title ||
      "RoomBazar";
    const body =
      (payload.notification && payload.notification.body) || data.body || "";

    // A stable tag collapses repeat notifications for the same thread instead
    // of stacking duplicates.
    const tag = data.chatId
      ? `chat-${data.chatId}`
      : data.notificationId
        ? `notif-${data.notificationId}`
        : "roombazar";

    self.registration.showNotification(title, {
      body,
      tag,
      renotify: true,
      icon: "/logo/rb-logo.png",
      badge: "/logo/rb-logo.png",
      data: { url: data.url || "/dashboard" },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  const absolute = new URL(target, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            client.focus();
            if ("navigate" in client) client.navigate(absolute);
            return undefined;
          }
        }
        return self.clients.openWindow(absolute);
      }),
  );
});
