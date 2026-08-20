import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportListingButton } from "./reportlistingbutton";
import { ShareListingButton } from "./sharelistingbutton";
import { formatRupees } from "@/lib/format/rupees";
import type { Listing } from "@/types/listing";

export function ListingListerPanel({ listing }: { listing: Listing }) {
  const { lister } = listing;
  const isLive = listing.status === "active";

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-semibold text-brand-700">
          {lister.name.charAt(0)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{lister.name}</p>

          <p className="text-xs text-ink-muted">{joinedLabel(lister.joinedAt)}</p>

        </div>

      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lister.verifications.includes("ownership") && (
          <Badge tone="success">Ownership verified</Badge>

        )}
        {lister.verifications.includes("governmentid") && (
          <Badge tone="success">ID verified</Badge>

        )}
        {lister.verifications.includes("phone") && (
          <Badge tone="neutral">Phone verified</Badge>

        )}
      </div>

      {lister.typicalReplyHours != null && (
        <p className="mt-3 text-xs text-ink-muted">
          Usually replies within {lister.typicalReplyHours} hours
        </p>

      )}

      {isLive ? (
        <>
          <Button fullWidth size="lg" className="mt-5">
            Message about this room
          </Button>

          <p className="mt-2 text-center text-xs text-ink-subtle">
            Your phone number stays private until you both choose to share it.
          </p>

          <ShareListingButton
            slug={listing.slug}
            title={listing.title}
            rent={formatRupees(listing.rentPaise)}
          />

        </>

      ) : (
        <p className="mt-5 rounded-control bg-surface-muted px-3 py-2.5 text-center text-sm text-ink-muted">
          This listing is closed
        </p>

      )}

      <div className="mt-4">
        <ReportListingButton listingId={listing.id} />

      </div>

    </div>

  );
}

function joinedLabel(joinedAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days < 1) return "Joined today";
  if (days < 30) return `Joined ${days} days ago`;
  if (days < 365) return `Joined ${Math.floor(days / 30)} months ago`;
  return `Joined ${Math.floor(days / 365)} years ago`;
}
