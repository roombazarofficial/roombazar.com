# RoomBazar — Firebase Cloud Messaging setup

This document is the operator runbook for turning on web push notifications.
The code is already implemented and deployed-ready; it stays dormant until the
environment variables below are present.

**Never put real credentials in this file or any other file in the repo.** The
`.env` files are git-ignored; everything real goes into the Vercel and Render
dashboards.

---

## 1. Firebase project

A Firebase project and a Web App are **already created** for RoomBazar. Do not
create new ones. If you are re-doing this from scratch on a fresh project:

1. <https://console.firebase.google.com> → **Add project**.
2. Skip Google Analytics unless you want it.

## 2. Web App

1. Project Overview → **Add app** → **Web** (`</>`).
2. Nickname: `RoomBazar Web`. Do **not** enable Firebase Hosting — RoomBazar
   stays on Vercel.
3. Register the app.

## 3. Copy the Web configuration

Project settings (gear icon) → **General** → **Your apps** → the Web app →
**SDK setup and configuration** → **Config**. You get:

```
apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
```

These map to the `NEXT_PUBLIC_FIREBASE_*` variables (section 10). They are
public by design.

## 4. Project Settings → Cloud Messaging

Project settings → **Cloud Messaging** tab. Make sure the **Cloud Messaging API
(V1)** is enabled (it is by default on new projects).

## 5. Generate the Web Push (VAPID) key

Same **Cloud Messaging** tab → **Web configuration** → **Web Push
certificates** → **Generate key pair**.

Copy the key string → this is `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.

## 6. Service Accounts → private key

Project settings → **Service accounts** → **Generate new private key** →
confirm. A JSON file downloads. From it you need three fields:

| JSON field       | Env var                 |
| ---------------- | ----------------------- |
| `project_id`     | `FIREBASE_PROJECT_ID`   |
| `client_email`   | `FIREBASE_CLIENT_EMAIL` |
| `private_key`    | `FIREBASE_PRIVATE_KEY`  |

Keep this file out of the repo. Store it in a password manager or delete it
after copying the values.

## 7. Configure Render (backend)

Render dashboard → the RoomBazar backend service → **Environment** → add:

```
FIREBASE_PROJECT_ID      = <project_id from the JSON>
FIREBASE_CLIENT_EMAIL    = <client_email from the JSON>
FIREBASE_PRIVATE_KEY     = <private_key from the JSON>
```

For `FIREBASE_PRIVATE_KEY`, paste the value exactly as it appears in the JSON,
including the `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`.
Render stores it as a single line with literal `\n`; the backend un-escapes
those at startup, and also tolerates the whole value being wrapped in quotes.

Save → Render redeploys.

## 8. Configure Vercel (frontend)

Vercel dashboard → RoomBazar project → **Settings** → **Environment Variables**
→ add for **Production** (and Preview if you want it there):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

## 9. Database

The Prisma schema gained two collections (`push_tokens`, `notification_logs`).
Apply them to MongoDB:

```
cd backend
npx prisma generate
npx prisma db push
```

`db push` is safe here — it only adds new collections and indexes, it does not
touch existing data. Render runs `prisma generate` on install automatically;
`db push` you run once, manually, against the production `DATABASE_URL`.

## 10. Deploy

- Push to the branch Render/Vercel deploy from (or trigger a manual redeploy on
  both after setting env vars).
- Confirm the backend log shows `Firebase Admin initialised for project …`
  instead of `Firebase credentials incomplete — push notifications are
  disabled.`

## 11. Environment variable reference

### Vercel (frontend)

| Variable                                 | Source                              |
| ---------------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`           | Web config (§3)                     |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`       | Web config (§3)                     |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`        | Web config (§3)                     |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`    | Web config (§3)                     |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Web config (§3)                   |
| `NEXT_PUBLIC_FIREBASE_APP_ID`            | Web config (§3)                     |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`         | Cloud Messaging → Web Push cert (§5) |

### Render (backend)

| Variable                | Source                          |
| ----------------------- | ------------------------------- |
| `FIREBASE_PROJECT_ID`   | Service account JSON (§6)        |
| `FIREBASE_CLIENT_EMAIL` | Service account JSON (§6)        |
| `FIREBASE_PRIVATE_KEY`  | Service account JSON (§6)        |

The existing `NEXT_PUBLIC_API_URL` (frontend) and `CORS_ORIGINS` /
`COOKIE_DOMAIN` (backend) are reused unchanged.

## 12. Test — end to end

1. Open <https://www.roombazar.com>, sign in.
2. Go to the dashboard. A card appears: **"Stay updated with RoomBazar 🔔"**.
   (It never auto-prompts — it waits for the click.)
3. Click **Enable notifications** → the browser permission prompt appears →
   Allow.
4. DevTools → Application → Service Workers: `firebase-messaging-sw.js` is
   activated.

## 13. Verify the browser permission is respected

- Deny the prompt instead: the card goes away and does not reappear on every
  page. `Dashboard → Settings → Notifications` shows a "blocked" message with
  instructions to re-allow in browser settings.

## 14. Verify the token in MongoDB

```
db.push_tokens.find({ isActive: true }).sort({ createdAt: -1 }).limit(5)
```

There should be one row per browser you enabled, with your `userId`, a
`browser` value, and `isActive: true`. Sign in on a second browser and enable —
you get a second row, same `userId`.

## 15. Verify Super Admin sending

1. Sign in as a super admin. The admin sidebar shows **Messaging → Send
   notification**.
2. `/admin/notifications`:
   - Send to **Specific user** (search yourself), title + message → **Send**.
   - The result panel shows Recipients / Successful / Failed / Invalid tokens
     removed.
   - You receive the notification (foreground = in-app toast, background =
     browser notification). Clicking it opens the destination URL and focuses
     the existing tab.
3. `/admin/notifications/history` lists the send with status and counts; the
   detail page shows recipients.
4. As a normal (non-super-admin) user, `GET /api/superadmin/notifications/history`
   returns 404 — the guard, not the hidden button, is the control.

## 16. Automatic notifications already wired

| Event                                   | Who is notified        | Deep link                       |
| --------------------------------------- | ---------------------- | ------------------------------- |
| New chat message                        | the other participant  | `/dashboard/inbox/{chatId}`     |
| Listing approved (super admin)          | the listing owner      | `/dashboard/listings/{id}`      |
| Listing rejected (super admin)          | the listing owner      | `/dashboard/listings/{id}`      |

The sender never gets a push for their own message.

## 17. Limitations / notes

- iOS Safari web push requires the site to be installed to the Home Screen
  (iOS 16.4+). Android Chrome, desktop Chrome, Edge and other Chromium browsers
  work directly.
- Category toggles on the settings page are stored per-browser
  (`localStorage`); server-side per-category suppression is not implemented yet
  — the architecture (notification `type`) supports adding it later.
- "All users" send fans out over every active token in one request path; for a
  very large user base this should move to a queue/worker. It is safe and
  correct as written for the current scale.
- Flutter/mobile: `push_tokens.deviceType` already accepts `android` / `ios`
  and the send path is token-based, so a future app registers through the same
  `POST /api/notifications/register-token` with no backend change.
