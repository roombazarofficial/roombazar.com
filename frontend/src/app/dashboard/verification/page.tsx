import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Verification is optional and incentivised, never mandatory. Requiring KYC
 * before a first listing would halve supply on day one; making the badge
 * worth having gets to the same place without the cliff.
 *
 * Each badge names exactly what was checked. A generic green tick that means
 * nothing in particular trains users to trust it for everything.
 */
const tiers = [
  {
    id: "phone",
    title: "Phone number",
    description: "Confirms you can be reached. Required for every account.",
    state: "done" as const,
    unlocks: "Post up to 2 rooms, message 10 people a day",
  },
  {
    id: "email",
    title: "Email address",
    description: "Used for alerts and to recover your account.",
    state: "available" as const,
    unlocks: "Digest emails for saved searches",
  },
  {
    id: "governmentid",
    title: "Government ID",
    description:
      "Verified through DigiLocker. We keep the result and your name, never your Aadhaar number.",
    state: "available" as const,
    unlocks: "Verified badge, post up to 5 rooms, higher ranking",
  },
  {
    id: "ownership",
    title: "Proof of ownership",
    description:
      "A utility bill or tax receipt matching the address. Reviewed by a person.",
    state: "locked" as const,
    unlocks: "Ownership verified badge, the strongest signal on a listing",
  },
];

export default function Page() {
  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Verification
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Optional, but verified listers get noticeably more enquiries.
        </p>
      </header>

      <ul className="mt-6 space-y-3">
        {tiers.map((tier) => (
          <li
            key={tier.id}
            className="rounded-card border border-line bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-ink">{tier.title}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {tier.description}
                </p>
                <p className="mt-2 text-xs text-ink-subtle">
                  Unlocks: {tier.unlocks}
                </p>
              </div>

              {tier.state === "done" ? (
                <Badge tone="success">Verified</Badge>
              ) : tier.state === "locked" ? (
                <Badge tone="neutral">Needs ID first</Badge>
              ) : (
                <Button size="sm" variant="secondary">
                  Verify
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 rounded-card border border-line bg-surface-muted p-4 text-sm text-ink-muted">
        We store a verification result and your name, never your Aadhaar
        number. Holding that number would be a liability with no benefit to
        you or to us.
      </p>
    </div>
  );
}
