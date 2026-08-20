# RoomBazar — backend

NestJS 10 · TypeScript · Clerk for authentication. Serves the frontend in
`../frontend` over HTTP under `/api`.

**Status:** built against in-memory repositories. No database yet — see
[Persistence](#persistence).

```bash
cp .env.example .env      # fill in the three Clerk keys
npm install
npm run dev               # http://localhost:4000/api
```

## Layout

```
src/
  domain/            entities — the storage shapes, framework-free
  persistence/
    ports/           repository interfaces (the seam)
    memory/          in-memory adapters used until the database lands
  modules/
    listings/        create, edit, lifecycle, ranking, presenters
    search/          the hot path; public
    conversations/   messaging, redaction, mutual contact reveal
    geography/       cities, localities with aliases, amenities
    users/           profile, account deletion, public profile
    saved/           saved listings and saved searches
    reports/         seeker-facing reporting
    moderation/      queue, actions, append-only audit log
    verification/    optional identity tiers
    uploads/         presigned R2 targets
    webhooks/        Clerk user sync
  common/            guards, decorators, filters, pipes, trust policy, geo
  config/            env validation
  main.ts
```

Each module owns its controller, service, DTOs and presenter. Nothing in
`modules/` imports from another module's internals — shared rules live in
`common/` or are exported explicitly by the owning module.

## Authentication

Clerk is the identity provider. This service never sees a password or an OTP.

- `ClerkAuthGuard` is registered globally, so **every route is protected unless
  it carries `@Public()`**. Opt-out beats opt-in: a forgotten guard would fail
  open, whereas a forgotten `@Public()` breaks the route loudly.
- The guard verifies the session token, then resolves it to **our own user row**,
  which carries trust level, role and moderation state. Clerk knows none of that.
- `RolesGuard` reads the role from that row, never from a token claim. A role
  baked into a JWT cannot be revoked until it expires, and removing a moderator
  has to take effect immediately.
- `POST /api/webhooks/clerk` keeps the local user table in sync. It is `@Public()`
  because Clerk cannot present a session token; authenticity comes from the Svix
  signature over the **raw** body, which is why `main.ts` sets `rawBody: true`.

We mirror the phone number locally rather than fetching it from Clerk per
request — the contact-reveal feature reads it at render time, and calling
Clerk's API for every conversation row would be slow and rate-limited.

> Note: [docs/02-architecture.md](../docs/02-architecture.md#auth) originally
> specified custom phone-OTP, partly because Indian SMS needs DLT-registered
> sender IDs and TRAI-approved templates. Clerk was chosen instead. Verify SMS
> delivery to Indian numbers early — that is the specific risk the original
> decision was guarding against.

## Persistence

Modules depend only on the interfaces in `persistence/ports`. The in-memory
adapters in `persistence/memory` are bound in `MemoryPersistenceModule`.

Introducing Postgres means writing a `PrismaPersistenceModule` that binds the
same tokens and swapping one import in `app.module.ts`. No service, controller
or presenter changes. That is the whole reason the backend was built before the
schema.

The in-memory filtering deliberately mirrors what the SQL will do, so behaviour
does not shift when the swap happens. What it cannot mirror is performance — it
scans every row.

## Privacy is structural, not remembered

Three mechanisms, because "remember not to return the phone number" is not a
mechanism:

1. **`SerializeInterceptor`** strips `phone`, `addressLine`, `lat`, `lng`,
   `clerkUserId` and `body` from every response, at any depth.
2. **Explicit prefix.** A presenter that genuinely needs to expose one emits
   `publicPhone` or `publicApproximateLat`, and the interceptor renames it. The
   prefix is deliberately awkward so an intentional exposure is obvious in review
   and cannot happen by accident.
3. **`fuzzCoordinates`** offsets a listing's position by roughly 300m before it
   is served, deterministically from the listing id so the circle does not move
   between requests and cannot be averaged out.

`body` is on the deny-list because the stored message body is the unredacted
original kept for moderation. Recipients get `publicBody`, which is the masked
version until both sides have agreed to share contact details.

## What is stubbed

Marked with `TODO` in the code, all needing external credentials or the database:

- R2 presigning (`uploads`) — returns the object key and a null upload URL
- DigiLocker and ownership review (`verification`)
- Moderation flag enqueueing when a message trips the redactor or the
  advance-payment detector
- Notifying a reporter of their report's outcome
- Background jobs: expiry sweep, renewal prompts, rank recompute, saved-search
  digests

## Testing

`npm test` — 86 tests across 7 suites, all covering pure functions that carry
product rules rather than framework wiring:

| Suite | What it pins down |
| --- | --- |
| `contactredaction.spec.ts` | Masking survives every evasion we know of, and cannot be made to backtrack catastrophically |
| `listinglifecycle.spec.ts` | The transition table, including that suspended is terminal from the owner side |
| `ranking.spec.ts` | **Rent does not influence rank**, which is the rule most likely to be broken by a well-meaning edit |
| `trustlevels.spec.ts` | Limits loosen monotonically; restricted can do nothing |
| `trustpromotion.spec.ts` | What earns a promotion, and that restrictions are never lifted automatically |
| `geo.spec.ts` | Coordinates are fuzzed, deterministic per listing, and bounded |
| `serialize.interceptor.spec.ts` | Private fields cannot be serialised, at any depth |

The redaction suite includes an adversarial timing test. Message bodies are
capped at 2000 characters, so it feeds the worst possible inputs and asserts
they complete well inside 250ms — a guard against a future edit introducing a
nested quantifier and turning the endpoint into a DoS vector.

## Operational hardening

- **Security headers** via helmet. CSP is deliberately off: this process serves
  only JSON, and a script policy belongs on the frontend that renders documents.
- **Compression**, because search responses are the largest thing this API
  returns and they go to phones on metered data.
- **`x-request-id`** on every response, generated if absent. A user reporting a
  failure can quote something that ties it to one line in the logs.
- **Request logging** with method, route pattern, status, duration and user id.
  Never the phone number, the body, or the query string — query strings here
  carry search filters, which are personal enough to keep out of log retention.
- **`trust proxy`** set, so per-IP throttling keys on the real client address
  rather than the load balancer.
- **Health split into liveness and readiness.** They answer different questions,
  and wiring a deploy to liveness alone routes traffic at an instance whose
  dependencies are not up. Both skip throttling.
- **Per-route throttles** on the endpoints that are cheap to abuse: opening
  conversations (5/min), messaging (20/min), reports (6/min), presigned uploads
  (15/min), listing creation (4/min). These sit alongside the per-trust-level
  limits — throttles are per-IP and stop bursts, trust limits are per-account
  and stop someone grinding away all day. Clerk webhooks get a deliberately high
  ceiling so a retry storm cannot desync the user table.
