# Trust & Safety

This is not a compliance appendix. In a marketplace with no payment rail, trust *is* the
product — there is no escrow, no transaction hold, and no refund to fall back on when
something goes wrong. Every abuse vector has to be handled before it happens, because
after it happens we have no lever at all.

## Threat model

| Threat | Who | Impact |
| --- | --- | --- |
| Fake listings | Scammers collecting advance "booking" payments | Direct financial harm to seekers; fatal to reputation |
| Stale listings | Listers who never mark rooms taken | Erodes the metric the whole product is judged on |
| Broker spam | Agents mass-posting duplicates and mislabelling as owner | Destroys the owner-only filter, our main differentiator |
| Phone harvesting | Scrapers collecting numbers for resale | Why contact is gated behind mutual reveal |
| Harassment | Via messaging, especially targeting women seekers | Safety risk; drives users off permanently |
| Address harvesting | Casing properties via exact map pins | Physical safety risk to listers |
| OTP abuse | Attackers burning our SMS budget | Direct cost, potential denial of signup |
| Discriminatory listings | Caste/religion-based exclusion | Legal exposure and a platform we would not want to run |

## Trust levels

Every user sits at one of four levels, driving rate limits and visibility.

**NEW** — phone verified only. Up to 2 active listings, 10 messages/day, listings ranked
lower until first successful contact. Deliberately restrictive: nearly all abuse comes
from accounts under a week old.

**VERIFIED** — completed identity verification (below). Up to 5 listings, 50 messages/day,
a visible badge, ranking boost.

**TRUSTED** — verified, plus a track record: 30+ days, listings marked taken rather than
left to expire, responsive, no upheld reports. Effectively unlimited, and their listings
skip pre-moderation.

**RESTRICTED** — under review or with upheld reports. Existing listings hidden, cannot
create new ones, can still read messages. A soft state, reversible on appeal.

Movement between levels is automatic where possible and reviewable by a moderator always.

## Identity verification

Optional, incentivised rather than mandatory. Mandatory KYC before a first listing would
halve supply on day one; making verification *worth having* gets there without the cliff.

Tiers, in rough order of what we would build:

1. **Phone** — required for everyone. Baseline.
2. **Email** — minor signal, useful for recovery.
3. **Government ID** — Aadhaar-based offline verification or DigiLocker. Deliberately
   **not** storing the Aadhaar number itself: we retain a verification token and the
   name/photo match result. Storing Aadhaar numbers is a regulatory liability with no
   product benefit whatsoever.
4. **Ownership proof** — utility bill or tax receipt matching the listing address,
   reviewed manually. Unlocks the strongest badge: "Ownership verified".

Badges state exactly what was checked. "Verified" with no referent trains users to trust a
green tick that means nothing.

## Listing moderation

Publish immediately, review in parallel. Holding listings for approval kills supply, and
the harm window for a bad listing is measured in the hours before a seeker contacts it —
which post-publication review comfortably covers.

**Automated, at publish:**
- Duplicate detection — perceptual hashing of photos plus text similarity within a city.
  The same room posted 14 times by an agent is the most common quality problem.
- Photos reverse-checked against known stock and previously-seen images. A photo lifted
  from another listing is the strongest single scam signal we have.
- Rent sanity vs locality median. A ₹3,000 2BHK in a ₹40,000 locality is bait or a scam.
- Text scanning for advance-payment language, off-platform contact, discriminatory terms.
- EXIF GPS vs declared locality mismatch.

**Queued for humans:** anything flagged above, all listings from NEW users, every reported
listing, and a random sample of the rest for calibration.

**Priority:** reported-by-multiple-users → scam signals → new user → random sample.

## The scam we most need to prevent

The dominant rental scam in this market: an attacker posts an attractive room below market
rate, refuses a physical visit citing travel or being out of station, and asks for a token
advance or deposit over UPI to "hold" the room. Then they disappear.

Our defences, in order of effectiveness:

1. **We never handle money, and say so loudly.** A persistent, unmissable notice on every
   listing and in every new conversation: *RoomBazaar never collects payments. Never pay
   an advance before visiting the room in person.*
2. **Refusing a visit is a reportable reason**, surfaced as a one-tap report option
   directly in the conversation UI.
3. **Payment-request language is detected in messages** and triggers an inline warning to
   the recipient plus a moderation flag — not a block, since legitimate rent discussion
   happens too.
4. **Below-market rent is flagged** for review before the listing gets ranking weight.
5. **New accounts are visibly new.** "Joined 2 days ago" on the listing costs the honest
   lister very little and the scammer a great deal.

The first one matters most. A user who has internalised "never pay before visiting" is
immune to the entire class.

## Messaging safety

- Contact details stripped until mutual reveal ([data model](01-data-model.md#conversation--message)).
- Block and report available from every conversation; blocking is immediate and silent to
  the blocker's counterparty.
- Rate limits scale with trust level.
- A seeker messaging 50 listings with an identical body and getting no replies is a spam
  pattern, flagged automatically.
- Messages are retained even when hidden — they are the evidence for every report.
- Women seekers get an extra prompt before first contact reveal, with safety guidance on
  meeting at the property. Not paternalistic gating, just information at the moment it is
  relevant.

We read message content only for automated safety scanning and for investigating a
specific report. This is stated plainly in the privacy policy. Anything vaguer than that
is a lie by omission.

## Tenant preferences

A genuinely difficult area, handled deliberately rather than by default.

Indian rental listings routinely carry tenant restrictions. Some are ordinary and lawful
in context — a family letting a room inside their own home preferring a female tenant, or
a landlord preferring long-stay working professionals. Others — excluding tenants by
caste, religion, or region — are discriminatory, and in the case of caste unlawful under
the Civil Rights Act 1955.

Where the line sits:

**Allowed**, as structured enum values only: family / bachelor (male or female) / student
/ working professional / any. Plus lawful house rules stated as amenities: veg-only
kitchen, no smoking, visitor timings.

**Prohibited**, and removed on detection: any reference to caste, religion, region of
origin, marital status beyond family-vs-bachelor, skin colour, or disability status.

Enforcement: `preferredTenant` is a closed enum, so the structured path simply cannot
express a prohibited filter. The free-text description is scanned for the usual phrasings
and their common euphemisms, in English and transliterated Hindi and Kannada. A first
offence gets the text stripped with an explanation; repeats move the account to
RESTRICTED.

We are not pretending to fix housing discrimination in India. We are declining to build
the tooling that makes it efficient, which is a smaller and achievable goal.

Gender preference stays permitted because for shared accommodation — a room inside an
occupied home, a shared flat, a PG — it is both lawful and a real safety consideration for
the people already living there. It is restricted to shared room types and does not apply
to whole-unit listings, where it has no such justification.

## Reporting

One tap from any listing, profile, or conversation. Reasons: fake or scam, already taken,
duplicate, wrong information, offensive content, harassment, discriminatory, other.

Target response: under 4 hours for scam and harassment, under 24 hours for the rest.
Reporters are told the outcome — silent reporting trains users to stop reporting.

"Already taken" reports at a threshold auto-transition the listing to TAKEN pending lister
confirmation. Seekers policing staleness is far more reliable than listers remembering to.

## Data protection

Under the DPDP Act 2023 we are a Data Fiduciary handling phone numbers, photos, location,
and message content.

- **Consent** is purpose-specific at collection, not a blanket signup checkbox.
- **Deletion** removes the account, listings, photos, and personal fields within 30 days.
  Messages are anonymised rather than deleted where they are evidence in an open report.
- **Access** — users can export their data.
- **Retention** — inactive accounts purged after 24 months of no login, with warning.
- **Breach notification** procedure documented before launch, not after an incident.
- **Minors** — under-18s are not permitted to transact. We do not currently verify age,
  which is a known gap and should be reconsidered before scaling PG and hostel listings,
  where student users skew younger.

## What we are not solving

Said plainly so nobody assumes otherwise:

- We cannot verify a room exists without visiting it. Ownership verification raises the
  cost of fraud; it does not eliminate it.
- We cannot guarantee anyone's safety at a viewing. We provide guidance and a report path.
- We are not a party to any rental agreement and offer no dispute resolution between
  landlord and tenant after they transact.
- We cannot fully prevent brokers mislabelling themselves as owners. Detection plus
  reporting plus penalties makes it costly and unreliable, not impossible.

These limits should be stated to users directly, in the product. A platform that
overpromises safety is more dangerous than one that is honest about its boundaries,
because users calibrate their own caution against what we claim.
