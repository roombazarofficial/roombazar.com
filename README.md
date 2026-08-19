# RoomBazaar

A peer-to-peer room marketplace. Anyone can list a room, anyone can find one, and both
sides talk to each other directly. No commission, no broker in the middle.

**Status:** design phase — no code yet.

## Documents

| Doc | What it covers |
| --- | --- |
| [Product spec](docs/00-product-spec.md) | Who this is for, the core flows, what we are deliberately not building |
| [Data model](docs/01-data-model.md) | Entities, schema, indexes, the listing lifecycle |
| [Architecture](docs/02-architecture.md) | Stack, auth, search, images, messaging, deployment |
| [Trust & safety](docs/03-trust-and-safety.md) | Abuse prevention, verification, moderation, discrimination policy |
| [Roadmap](docs/04-roadmap.md) | Milestones from empty repo to launch |

## The short version

Most room-finding in India routes through brokers who charge one to two months' rent for
an introduction. RoomBazaar removes that introduction fee. The platform's job is
**discovery and trust**, not transaction capture — we never touch the rent, the deposit,
or the agreement.

That single decision shapes everything downstream. There is no payment rail, so there is
no payment rail to gate abuse with; trust has to be built from verification, moderation,
and reputation instead. See [Trust & safety](docs/03-trust-and-safety.md), which is not an
afterthought here — it is load-bearing.

## Stack

Next.js (App Router, TypeScript) · PostgreSQL via Prisma · Cloudflare R2 for images ·
phone-OTP auth. Rationale in [Architecture](docs/02-architecture.md).

## Launch market

India. Rent in ₹/month, deposits expressed in months of rent, phone-first identity,
city + locality search. The schema avoids hardcoding these so a second market is a
migration rather than a rewrite, but no effort is spent supporting one before it exists.
