import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { OwnerListingCard } from "@/components/dashboard/ownerlistingcard";
import { EmptyState } from "@/components/ui/emptystate";
import { getMyListings } from "@/lib/api/listings";
import { getConversations } from "@/lib/api/conversations";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const [listings, conversations] = await Promise.all([
    getMyListings(),
    getConversations(),
  ]);

  const active = listings.filter((listing) => listing.status === "active");
  const pending = listings.filter(
    (listing) => listing.status === "pendingapproval",
  );
  const closed = listings.filter(
    (listing) =>
      listing.status !== "active" && listing.status !== "pendingapproval",
  );

  const unread = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0,
  );
  const totalViews = listings.reduce(
    (sum, listing) => sum + listing.viewCount,
    0,
  );

  const expiring = active.filter((listing) => {
    if (!listing.expiresAt) return false;
    const days =
      (new Date(listing.expiresAt).getTime() - Date.now()) / 86_400_000;
    return days <= 10;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Your rooms
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your ads, reviews, and tenant enquiries.
          </p>
        </div>

        <Link href={routes.post} className={buttonStyles()}>
          Host a room
        </Link>
      </header>

      {(unread > 0 || expiring.length > 0) && (
        <section className="space-y-3">
          {unread > 0 && (
            <Link
              href={routes.inbox}
              className="flex items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 p-4 hover:bg-brand-100"
            >
              <div>
                <p className="text-sm font-medium text-brand-700">
                  {unread} {unread === 1 ? "message" : "messages"} waiting for
                  your reply
                </p>
                <p className="mt-0.5 text-sm text-brand-700">
                  Seekers usually move on within a day if nobody answers.
                </p>
              </div>
              <span aria-hidden className="text-brand-700">
                →
              </span>
            </Link>
          )}

          {expiring.map((listing) => (
            <div
              key={listing.id}
              className="rounded-card border border-warning/20 bg-warning-soft p-4"
            >
              <p className="text-sm font-medium text-warning">
                “{listing.title}” expires soon
              </p>
              <p className="mt-0.5 text-sm text-warning">
                Renew it if the room is still free, or mark it taken so seekers
                stop messaging you about it.
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total rooms" value={String(listings.length)} />
        <Stat label="Live rooms" value={String(active.length)} />
        <Stat label="In review" value={String(pending.length)} />
        <Stat label="Total views" value={String(totalViews)} />
      </div>

      {/* Empty State */}
      {listings.length === 0 ? (
        <EmptyState
          title="No rooms listed yet"
          description="Posting is free and takes about three minutes. Your phone number stays private."
          action={
            <Link href={routes.post} className={buttonStyles()}>
              Post your first room
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Pending Approval Section */}
          {pending.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <span>⏳</span> In review ({pending.length})
                </h2>
                <span className="text-xs text-amber-700 font-medium">
                  Waiting for admin verification
                </span>
              </div>
              <div className="space-y-3">
                {pending.map((listing) => (
                  <OwnerListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}

          {/* Active Live Rooms Section */}
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-ink flex items-center gap-2">
                <span>🟢</span> Live rooms ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((listing) => (
                  <OwnerListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}

          {/* Closed / Taken Rooms Section */}
          {closed.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-ink">
                Taken and expired ({closed.length})
              </h2>
              <div className="space-y-3">
                {closed.map((listing) => (
                  <OwnerListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
