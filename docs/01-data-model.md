# Data Model

PostgreSQL, accessed through Prisma. This document is the source of truth for the schema;
`prisma/schema.prisma` should be generated to match it.

## Conventions

- **IDs:** UUID v7 primary keys. Time-ordered, so they index well and do not leak counts
  the way sequential integers do.
- **Money:** integer paise, never floats. `rentPaise: 1500000` is ₹15,000. Displayed as
  whole rupees; the sub-rupee precision exists so arithmetic never drifts.
- **Timestamps:** `timestamptz`, always UTC in the database, rendered in IST at the edge.
- **Deletion:** soft delete via `deletedAt` on User and Listing. Messages are never
  deleted, only hidden, because they are the evidence trail for abuse reports.
- **Enums:** Postgres enums for closed sets that rarely change; lookup tables for sets
  that grow (localities, amenities).

## Entities

### User

Identity is a **phone number**, not an email. In this market, phone is what people have,
what they check, and what they use to be reached. Email is optional and used for
notification digests only.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | |
| phone | text unique | E.164, e.g. `+919876543210` |
| phoneVerifiedAt | timestamptz? | Null until OTP completes |
| email | text? unique | Optional, separately verified |
| name | text | Display name, required at first listing or first message |
| avatarKey | text? | Object key in R2 |
| role | enum | `USER`, `MODERATOR`, `ADMIN` |
| trustLevel | enum | `NEW`, `VERIFIED`, `TRUSTED`, `RESTRICTED` — see trust doc |
| createdAt / updatedAt / deletedAt | timestamptz | |

We store the phone number itself, not only a hash — the product needs to reveal it to a
counterparty on mutual consent. It is encrypted at rest at the column level and never
included in any API response unless the requesting user has an active mutual reveal.

Under the DPDP Act 2023 this makes us a Data Fiduciary for a fairly sensitive field.
Consequences for deletion and consent are in [Trust & safety](03-trust-and-safety.md).

### Listing

The central entity.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | |
| ownerId | uuid → User | |
| status | enum | See lifecycle below |
| postedBy | enum | `OWNER`, `TENANT`, `AGENT` — declared, and shown as a badge |
| roomType | enum | `SINGLE_ROOM`, `SHARED_ROOM`, `PG_BED`, `RK_1`, `BHK_1`, `BHK_2`, `BHK_3_PLUS`, `HOSTEL_BED` |
| title | text | Generated from attributes if the lister leaves it blank |
| description | text | |
| rentPaise | int | Monthly |
| depositPaise | int | Absolute, not "months" — listers think in months, the UI converts |
| maintenancePaise | int? | Null means "included" |
| billsIncluded | bool | Electricity/water folded into rent |
| cityId | uuid → City | |
| localityId | uuid → Locality | |
| addressLine | text? | Never shown publicly; used for moderation and map pin |
| lat / lng | double? | Optional, approximate — see [Location](#location-privacy) |
| furnishing | enum | `UNFURNISHED`, `SEMI`, `FULL` |
| areaSqft | int? | |
| floor | int? / totalFloors | int? | |
| availableFrom | date | |
| minStayMonths | int? | |
| preferredTenant | enum[] | `FAMILY`, `BACHELOR_MALE`, `BACHELOR_FEMALE`, `STUDENT`, `WORKING_PROFESSIONAL`, `ANY` |
| viewCount | int | Denormalised, incremented async |
| publishedAt / expiresAt | timestamptz | |
| createdAt / updatedAt / deletedAt | timestamptz | |

`preferredTenant` is a constrained enum on purpose. Free-text tenant preferences in this
market routinely encode caste and religion filters; a closed list makes that impossible to
express in structured data, and the description field is moderated for the same. The
policy reasoning is in [Trust & safety](03-trust-and-safety.md#tenant-preferences) — it is
a deliberate call, not an oversight.

### ListingPhoto

| Field | Type | Notes |
| --- | --- | --- |
| id / listingId | uuid | |
| objectKey | text | R2 key for the original |
| width / height | int | Stored so the client reserves layout space and avoids reflow |
| blurhash | text | Placeholder while loading — matters on Indian mobile data |
| position | int | Lister-controlled order; position 0 is the cover |
| moderationState | enum | `PENDING`, `OK`, `REJECTED` |

At least one photo is required to publish. Listings without photos are ignored by seekers
and drag down the perceived quality of every search result they appear in.

### City / Locality

Lookup tables, seeded and admin-managed, not free text.

`City`: id, name, state, slug, isActive, centroid lat/lng.
`Locality`: id, cityId, name, slug, aliases (text[]), centroid lat/lng.

`aliases` matters more than it looks. "Indiranagar", "Indira Nagar", and "Indranagar" must
resolve to one locality or search fragments and both sides of the market stop finding each
other. Seeding a curated locality list per city is real work and is a launch blocker, not
a nice-to-have.

Free-text locality entry is the single easiest way to destroy search quality in this
product. The lister picks from a typeahead; if their locality is missing they request it,
and it lands in an admin queue.

### Amenity / ListingAmenity

`Amenity`: id, slug, label, category (`UTILITIES`, `SAFETY`, `CONVENIENCE`, `RULES`).
`ListingAmenity`: join table.

Seed set for India: attached bathroom, western toilet, geyser, power backup, borewell/
24×7 water, lift, parking (two-wheeler / car), wifi, kitchen access, washing machine,
fridge, AC, cot & mattress, security guard, CCTV, gated society, pets allowed,
non-veg allowed, visitors allowed, no gate-closing time.

A join table rather than a JSON blob because amenity filters must be indexed and countable
("142 rooms with power backup in this locality").

### Conversation / Message

| Conversation | | |
| --- | --- | --- |
| id | uuid | |
| listingId | uuid → Listing | |
| seekerId / listerId | uuid → User | |
| seekerRevealedAt | timestamptz? | Seeker consented to share their number |
| listerRevealedAt | timestamptz? | Lister consented to share theirs |
| lastMessageAt | timestamptz | Denormalised for inbox ordering |
| status | enum | `ACTIVE`, `ARCHIVED_BY_SEEKER`, `ARCHIVED_BY_LISTER`, `BLOCKED` |

Unique on `(listingId, seekerId)` — one thread per seeker per listing, so a seeker cannot
spam a lister by opening new threads.

| Message | | |
| --- | --- | --- |
| id / conversationId | uuid | |
| senderId | uuid → User | |
| body | text | |
| redactedBody | text? | Populated when contact info is stripped pre-reveal |
| readAt | timestamptz? | |
| hiddenAt | timestamptz? | Moderation, never a hard delete |

**Contact info in message bodies is stripped until mutual reveal.** Phone numbers, emails,
and messaging handles are detected and masked, with the original retained in `body` for
moderation and the masked version in `redactedBody` for display. Without this the reveal
gate is decorative — the first message would simply read "call me on 98765 43210".

Both numbers become visible to each other only when `seekerRevealedAt` and
`listerRevealedAt` are both non-null. Revealing is a distinct, logged action.

### Report / ModerationAction

`Report`: id, reporterId, targetType (`LISTING`/`USER`/`MESSAGE`), targetId, reason enum,
detail text, status, createdAt.

`ModerationAction`: id, moderatorId, targetType, targetId, action enum, note, createdAt.
Append-only audit log. Every state change a moderator makes writes a row; nothing about a
suspension is inferable only from the mutated record.

### SavedSearch / SavedListing

`SavedListing`: userId, listingId, createdAt.
`SavedSearch`: userId, the serialised filter set, notifyFrequency (`OFF`/`DAILY`/`INSTANT`).

Saved searches are the main retention loop. A seeker who saves a search and gets a
matching new listing the next morning comes back without any paid acquisition.

## Listing lifecycle

```
DRAFT ──publish──> ACTIVE ──────────┬──"room taken"──> TAKEN
                     │              │
                     │              ├──30d, no renew──> EXPIRED
                     │              │
                     │              └──moderation─────> SUSPENDED
                     │
                     └──lister pause──> PAUSED ──resume──> ACTIVE
```

- Only `ACTIVE` listings appear in search.
- `TAKEN` and `EXPIRED` listings stay readable at their URL, clearly marked, with a link
  to similar rooms. Deleting them wastes the SEO and confuses returning seekers.
- Reactivating an `EXPIRED` listing requires confirming rent and availability, so renewal
  cannot be used to keep a stale listing alive indefinitely.
- `SUSPENDED` is moderator-only and 404s publicly.

The transition that matters most is **ACTIVE → TAKEN**. Every design decision that makes
it easier — one-tap from the notification, from the email, from the card — directly
protects the "under 5% already-taken" metric in the [product spec](00-product-spec.md).

## Indexes

The search query is the hot path. It filters on city + locality + status + rent range and
sorts by a recency/completeness blend.

```sql
-- primary search path
CREATE INDEX listing_search_idx ON "Listing" (city_id, status, published_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX listing_locality_idx ON "Listing" (locality_id, status, rent_paise)
  WHERE deleted_at IS NULL AND status = 'ACTIVE';

-- inbox
CREATE INDEX conversation_lister_idx ON "Conversation" (lister_id, last_message_at DESC);
CREATE INDEX conversation_seeker_idx ON "Conversation" (seeker_id, last_message_at DESC);
CREATE INDEX message_thread_idx ON "Message" (conversation_id, created_at DESC);

-- expiry sweep
CREATE INDEX listing_expiry_idx ON "Listing" (expires_at) WHERE status = 'ACTIVE';
```

Partial indexes on `status = 'ACTIVE'` are worth it: active listings are a shrinking
minority of the table within a year, and every search touches only them.

Full-text search over title + description is a **secondary** path, not the primary one.
Structured filters answer most queries in this market. Start with a `tsvector` generated
column and a GIN index; do not reach for Elasticsearch until Postgres demonstrably fails.

## Location privacy

Exact coordinates of a room someone lives in are sensitive, and a map pin on an
unverified listing invites both stalking and address harvesting.

- `lat`/`lng` are optional and stored at full precision for moderation.
- Publicly, coordinates are **fuzzed to roughly a 300 m radius** and rendered as a circle,
  never a pin, until mutual contact reveal.
- `addressLine` is never returned by any public endpoint.

This costs a little search precision and is worth it.

## Open questions

- **PG operators with 30 identical beds.** Modelling each bed as a Listing floods search;
  modelling the property as one Listing loses per-bed availability. Likely needs a
  `Property` parent with listings under it. Deferred until PG supply actually shows up.
- **Rent negotiability.** Listers routinely mean "₹15,000, negotiable". A boolean is easy;
  whether it changes seeker behaviour enough to earn schema space is untested.
- **Locality seeding source.** Curating localities per city by hand is slow but reliable;
  importing from an open dataset is fast but noisy. Needs a decision before city two.
