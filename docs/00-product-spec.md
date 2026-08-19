# Product Spec

## The problem

Finding a room to rent in an Indian city usually costs one to two months' rent in broker
fees, paid for little more than a phone number and a site visit. Listings on existing
portals are dominated by brokers who post the same flat repeatedly, list rooms that are
already taken, and use bait pricing to generate calls. Someone with a genuine spare room
has no low-friction way to reach the people looking for exactly that.

Both sides of this market are underserved by the same thing: an intermediary whose
incentive is call volume, not a completed match.

## The bet

If discovery is good enough and both parties can trust each other enough to meet, they do
not need us for anything else. Rent, deposit, and the agreement happen between them.

We therefore make money from neither the transaction nor the introduction. What we sell,
eventually, is visibility (see [Money](#money)) — and only in ways that do not corrupt
the ranking of genuine listings.

## Users

**Lister** — has a room, a bed in a shared flat, a PG, or a whole 1BHK to rent out.
May be an owner, a tenant sub-letting, or an existing flatmate looking for a replacement.
Typically posts from a phone, has 4–8 photos of varying quality, and wants to stop
answering calls the moment the room is taken.

**Seeker** — student, working professional, or family looking for a place. Browsing on a
phone, on mobile data, often comparing across several tabs and WhatsApp forwards. Cares
about rent, deposit, distance to work/college, and whether the listing is real.

The same account can be both. There is no separate "lister signup" — you sign up, and
posting a room is an action you take.

**Brokers are not banned, they are labelled.** Attempting to exclude them entirely is
unenforceable and pushes them into lying. Instead, every listing declares whether it is
posted by the owner/occupant or by an agent, and seekers can filter to owner-only. This
is the single most requested filter in this market and the clearest reason to choose us.

## Core flows

### 1. Post a listing

Phone OTP → basic details → photos → publish. The form is ordered so a lister can stop
after the required fields and still have a live listing.

Required: room type, monthly rent, deposit, city, locality, at least one photo,
availability date, who is posting (owner / tenant / agent).

Optional: furnishing, amenities, preferred tenant type, floor, area in sq ft, exact map
pin, house rules, notice period.

The listing goes live immediately but enters the moderation queue in parallel (see
[Trust & safety](03-trust-and-safety.md)). Holding listings for review before publication
kills supply; reviewing them after publication does not.

### 2. Find a room

Search by city, then narrow by locality, rent range, room type, furnishing, and
owner-only. Results are cards: photo, rent, deposit, locality, room type, posted-by
badge, freshness. Map view is secondary — most seekers in this market filter by named
locality, not by drawing on a map.

Sorting defaults to a **relevance blend of recency and completeness**, never to price.
Price-ascending as a default rewards bait listings.

### 3. Make contact

Seeker opens a listing and sends the first message. The lister's phone number is **not**
visible at this point.

Once the lister replies, both sides may choose to reveal their number to each other. The
reveal is mutual, explicit, and per-conversation — never automatic, never one-directional.

Rationale: the moment phone numbers are public, listers get spam-called by brokers and
seekers get their numbers scraped. Gating contact behind a reply also gives us a clean
abuse signal — accounts that message hundreds of listings and never get replies are
trivially identifiable.

### 4. Close the listing

One tap: "Room taken". This is the most important maintenance action in the product and
must be reachable from a notification, an email, and the listing card itself.

Listings auto-expire after 30 days unless renewed. We prompt at day 21 and day 28. A
marketplace's credibility dies from stale listings faster than from thin supply.

## Out of scope

Deliberately not building, and the reason why:

- **Payments, escrow, deposits.** No take-rate means no payment rail. Adding one makes us
  liable for money we have no reason to hold.
- **Rental agreements, e-stamping, police verification.** Real needs, but each is a
  regulated business of its own. Possibly a partner integration much later; never core.
- **Ratings of individual people.** A public 1-star on a private landlord is a defamation
  claim waiting to happen and is trivially weaponised. We track behaviour signals
  internally and act on them, rather than publishing scores.
- **Roommate-personality matching.** A different product with a different data model.
- **Native apps at launch.** A fast mobile web app reaches more of this market sooner.

## Money

Not at launch. Once there is real supply and demand, in rough order of preference:

1. **Featured placement** for listers, clearly labelled, capped per results page, and
   never allowed to outrank on a filter the seeker explicitly set.
2. **Verified badge** at a nominal fee covering the verification cost.
3. **Business accounts** for PG operators and co-living brands managing many rooms.

What we will not do: charge seekers to see contact details. It is the standard model of
the incumbents, it inverts our entire premise, and it makes every listing's quality
someone else's problem.

## What success looks like

At launch, in one city:

- A seeker searching a real locality finds at least 10 genuine, currently-available rooms.
- Over half of published listings come from owners or tenants, not agents.
- Median time from first message to lister reply is under 12 hours.
- Under 5% of listings that seekers contact turn out to be already taken.

The last metric is the one that decides whether this works. Everything in
[Trust & safety](03-trust-and-safety.md) and the listing lifecycle in the
[data model](01-data-model.md) exists to protect it.
