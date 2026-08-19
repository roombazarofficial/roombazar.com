# Roadmap

Milestones are ordered by dependency, not by calendar. Durations assume one developer and
are estimates, not commitments.

## M0 — Foundation (~1 week)

Next.js + TypeScript + Tailwind scaffold. Postgres via Docker locally. Prisma with the
schema from the [data model](01-data-model.md). Seed script: one city, its localities,
the amenity set. CI running typecheck, lint, and tests. Deploy an empty app to Vercel on
day one so deployment is never a late surprise.

**Done when:** `npm run dev` works from a clean clone, and main auto-deploys.

## M1 — Auth (~1 week)

Phone OTP request and verify, sessions, rate limiting, the SMS provider interface with a
console driver for local. Profile with name and avatar.

**Done when:** a real phone receives a code and ends up with a session cookie that
survives a restart and can be revoked server-side.

This is the most abuse-sensitive path in the product. Rate limits are part of the
milestone, not a follow-up.

## M2 — Listings (~2 weeks)

The create wizard, direct-to-R2 photo upload with EXIF stripping and blurhash, edit,
pause, mark taken, delete. The dashboard. Public listing page, server-rendered, with
structured data. The full lifecycle state machine including expiry and renewal jobs.

**Done when:** someone can post a room from a phone in under three minutes and see it live
at a shareable URL.

The three-minute target is a real constraint. Every field added to the required set is
paid for in lost supply.

## M3 — Search (~2 weeks)

City and locality pages, the filter set, `rank_score` computation and its recompute job,
keyset pagination, the locality typeahead with alias matching, saved listings and saved
searches. SEO: sitemap, metadata, structured data, locality page content.

**Done when:** searching a real locality returns correctly filtered, sensibly ordered
results in under 200 ms.

## M4 — Messaging (~2 weeks)

Conversations and messages, the inbox, polling, the contact-stripping filter, mutual
contact reveal, block, and email/push notification on new message.

**Done when:** a seeker can contact a lister, neither sees the other's number, and both
numbers appear only after both consent.

## M5 — Trust & safety (~2 weeks)

Trust levels and their rate limits, the report flow, the moderation queue and admin tools,
the automated flagging described in the [trust doc](03-trust-and-safety.md) — duplicate
detection, photo hashing, rent sanity, prohibited-term scanning — and the audit log.

**Done when:** a moderator can work a queue end to end, and every action leaves an audit
row.

This milestone is not optional and is not deferrable past launch. Launching without it
means finding out about the first scam from a user, with no tooling to respond.

## M6 — Launch prep (~1–2 weeks)

Seed real supply — the launch city needs listings before it needs seekers, and the first
few hundred will come from manual outreach, not from the product. Legal pages: terms,
privacy policy reflecting the DPDP commitments, content policy. Analytics for the four
success metrics. Error tracking. Load test the search path. Accessibility pass.
Performance pass on 3G.

**Done when:** the metrics in the [product spec](00-product-spec.md#what-success-looks-like)
are all measurable on a dashboard, and the site is usable on a slow connection.

## Post-launch, in likely order

Map view · WhatsApp notifications (where users actually are) · verification tiers beyond
phone · rent trend data per locality · PG/property parent modelling · second city ·
featured placement · native apps.

Nothing here is committed. The order should be rewritten by what the first thousand real
users actually do.

## Sequencing notes

**Why search before messaging:** a seeker who cannot find a room has nothing to message
about. Supply and discovery have to work before the contact loop is worth building.

**Why trust & safety is a milestone, not a phase:** the pieces that must exist earlier are
already inside earlier milestones — OTP rate limiting in M1, EXIF stripping in M2, contact
stripping in M4. M5 is the moderation *system*; the primitives ship with the features they
protect.

**The riskiest assumption** is not technical. It is whether enough owners will post
directly to reach critical supply in one city without broker inventory. M6's manual
outreach is where that assumption gets tested, and it should be tested with a landing page
before M2 is finished, not after M6.
