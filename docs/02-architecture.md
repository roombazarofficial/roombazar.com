# Architecture

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15, App Router, TypeScript | Server-rendered listing pages are the acquisition channel; see [SEO](#seo-is-the-architecture) |
| Database | PostgreSQL 16 | Relational data with real constraints; full-text and geo without extra infrastructure |
| ORM | Prisma | Typed queries, migration history, low ceremony |
| Images | Cloudflare R2 + Next/Image | S3-compatible with zero egress fees — the dominant cost in a photo-heavy product |
| Auth | Custom phone-OTP, sessions in Postgres | No mainstream provider does Indian phone-OTP well; see [Auth](#auth) |
| SMS | MSG91 or Twilio behind one interface | DLT registration in India makes the provider swappable-by-necessity |
| Styling | Tailwind | |
| Hosting | Vercel (app) + Neon or Supabase (Postgres) | Both scale down to near-zero cost pre-launch |
| Jobs | Postgres-backed queue (pg-boss) | One less service; the job volume here is small |

The consistent principle: **fewest moving parts that can still handle the launch city.**
Every additional service is an outage source and a monthly bill before there is revenue.

## SEO is the architecture

Most seekers will arrive from a search engine query like
"single room for rent in Koramangala under 15000", not from the homepage. That makes
server-rendered, indexable listing and locality pages the primary acquisition channel and
the main reason to pick Next.js over a client-only SPA.

Consequences that are not optional:

- `/rooms/[city]/[locality]` and `/room/[id]-[slug]` are statically or incrementally
  rendered, never client-fetched.
- Listing pages emit `Product`/`Offer` structured data and a `RealEstateListing` where it
  fits.
- `TAKEN` and `EXPIRED` listings keep their URLs with `noindex` plus visible links to
  similar rooms, rather than 404ing accumulated authority away.
- Locality pages have real content — rent ranges, counts by room type — so they are not
  thin duplicates of each other.

## Routes

```
/                                     home + city picker
/rooms/[city]                         city search
/rooms/[city]/[locality]              locality landing (SEO surface)
/room/[id]-[slug]                     listing detail
/post                                 create listing wizard
/dashboard                            my listings
/inbox  /inbox/[conversationId]       messaging
/saved                                saved listings + searches
/u/[id]                               public profile (sparse by design)
/admin/*                              moderation queue, locality requests
```

API lives in Route Handlers under `/api`. Server Actions handle form mutations where the
result is a redirect or a revalidation; anything a future mobile app would need is a
proper JSON endpoint from the start.

## Auth

Phone + OTP, built in-house.

```
POST /api/auth/otp/request   { phone }        → rate limited, sends 6-digit code
POST /api/auth/otp/verify    { phone, code }  → sets session cookie
```

- Codes are 6 digits, 5-minute TTL, **hashed** in the database, single-use, invalidated on
  a new request for the same number.
- Rate limits: 3 requests per phone per 15 min, 10 per IP per hour, exponential backoff on
  repeat. SMS costs real money and OTP endpoints are the classic way to be billed for
  someone else's fun.
- 5 wrong attempts locks that code and forces a new request.
- Sessions are opaque tokens in a `Session` table, `httpOnly` + `Secure` + `SameSite=Lax`,
  30-day sliding expiry, revocable server-side. Not JWTs — we need instant revocation when
  an account is suspended, and a stateless token cannot give us that.

**Why not Auth0/Clerk/NextAuth:** Indian phone-OTP means DLT-registered sender IDs and
approved template IDs with TRAI. Providers either do not support this or wrap it thinly,
and the flow is the single most abuse-sensitive path in the product. It is worth owning
outright — it is roughly 300 lines.

Email/password is not offered. A second credential type doubles the account-recovery
attack surface for a population that overwhelmingly logs in by phone.

## Search

Postgres does all of it at launch.

```sql
SELECT ... FROM "Listing" l
WHERE l.status = 'ACTIVE' AND l.deleted_at IS NULL
  AND l.city_id = $1
  AND ($2::uuid[] IS NULL OR l.locality_id = ANY($2))
  AND l.rent_paise BETWEEN $3 AND $4
  AND ($5::text[] IS NULL OR l.room_type = ANY($5))
ORDER BY l.rank_score DESC, l.published_at DESC
LIMIT 24 OFFSET $6;
```

`rank_score` is a stored, periodically recomputed column, not a runtime expression —
sorting by a computed expression cannot use an index, and this is the hot path.

Its inputs: recency (decaying), photo count and quality, field completeness, lister
responsiveness, and verification status. Explicitly **not** rent — cheapest-first ordering
rewards bait pricing, as covered in the [product spec](00-product-spec.md#2-find-a-room).

Keyset pagination past page 5; `OFFSET` degrades and deep pages are mostly crawlers.

Geo radius search is deferred. Locality filtering covers the real queries; when radius is
needed, `cube` + `earthdistance` handles it before PostGIS becomes necessary.

## Images

Uploads go **directly from the browser to R2** via presigned URLs. Proxying uploads
through the app server on Vercel means paying for bandwidth twice and hitting request
size limits on the exact flow that must not fail.

```
POST /api/uploads/presign  → { uploadUrl, objectKey }
browser PUTs to R2
POST /api/listings/:id/photos { objectKey, width, height }
```

Server-side after upload: verify the object exists and its real content type, strip EXIF
(GPS in a room photo leaks the address the [data model](01-data-model.md#location-privacy)
deliberately fuzzes), generate a blurhash, queue moderation.

Never trust the client's declared MIME type or dimensions. Re-derive both.

Serving is via Next/Image with AVIF/WebP, sized for mobile first. Assume a slow connection
and a metered data plan; a 4 MB hero image is a bounced seeker.

## Messaging

Polling, not WebSockets, at launch. The inbox polls every 15 s while focused and stops
when hidden. Room-rental conversations move on a scale of hours, and persistent
connections on serverless hosting are an unforced cost. Revisit if it ever feels slow.

New messages also trigger a push/email notification, which is what actually drives replies.

The contact-stripping filter runs on every outbound message before mutual reveal —
phone numbers (including spaced, hyphenated, and word-spelled forms), emails, and
messaging handles. It will not be perfect. It needs to be good enough that evading it is
deliberate, because deliberate evasion is itself a reportable signal.

## Background jobs

Via pg-boss:

- expire listings past `expiresAt`
- send renewal prompts at day 21 and 28
- recompute `rank_score`
- saved-search digests
- image moderation
- unread-message reminders

## Security baseline

- Every mutation authorises against the acting user; never trust an ID from the client.
- Zod validation at every boundary, inbound and outbound.
- Rate limits on OTP, message send, listing create, report, and presign.
- Phone numbers encrypted at the column level; decrypted only for OTP delivery and for an
  authorised mutual reveal.
- Strict CSP; no inline scripts.
- No public endpoint returns `addressLine`, exact `lat`/`lng`, or another user's phone.
  Enforced in a serialisation layer, not per-handler — the leak will otherwise happen in
  the one endpoint someone forgot.
- Audit log for all moderation actions.

## Environments

`local` (Docker Postgres, OTP printed to console, R2 replaced by local disk) →
`preview` (per-PR Vercel + branch database, seeded) → `production`.

OTPs must never be logged in production, and preview environments must never send real
SMS.

## Deferred

Redis (Postgres handles rate limits and caching at this scale), Elasticsearch, native
apps, CDN beyond Vercel's, microservices, GraphQL, i18n infrastructure.

Each of these solves a problem worth solving *later*. Adding any of them before launch
buys complexity against traffic that does not exist yet.
