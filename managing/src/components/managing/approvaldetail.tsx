"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRupees, depositInMonths } from "@/lib/format/rupees";
import {
  approveListing,
  getApproval,
  rejectListing,
  type ApprovalRow,
} from "@/lib/api/superadmin";

export function ApprovalDetail({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [row, setRow] = useState<ApprovalRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getApproval(listingId)
      .then(setRow)
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "Could not load"),
      );
  }, [listingId]);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);

    try {
      await action();
      router.push("/approvals");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed");
      setBusy(false);
    }
  }

  if (error && !row) {
    return (
      <div className="rounded-card border border-danger/20 bg-danger-soft p-4">
        <p className="text-sm text-danger">{error}</p>
        <Link
          href="/approvals"
          className="mt-2 inline-block text-sm underline"
        >
          Back to the queue
        </Link>
      </div>
    );
  }

  if (!row) return <p className="text-sm text-ink-muted">Loading…</p>;

  const { listing } = row;
  const months = depositInMonths(listing.depositPaise, listing.rentPaise);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <Link
          href="/approvals"
          className="text-sm text-ink-muted hover:text-ink"
        >
          ← Queue
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {listing.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatRupees(listing.rentPaise)}/month ·{" "}
          {listing.locality?.name ?? "Unknown locality"} · waiting{" "}
          {row.waitingHours}h
        </p>

        {/*
          Photos first. Most rejections are decided by looking at them — a room
          that does not match its description, or images lifted from elsewhere.
        */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">
            Photos ({listing.photos?.length ?? 0})
          </h2>

          {listing.photos && listing.photos.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {listing.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt=""
                  className="aspect-4/3 w-full rounded-control object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
              No photos. A listing without them should not be hosted.
            </p>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Description</h2>
          <p className="mt-2 whitespace-pre-line rounded-card border border-line bg-surface p-4 text-sm text-ink-muted">
            {listing.description || "(none provided)"}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Details</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Detail label="Rent" value={formatRupees(listing.rentPaise)} />
            <Detail
              label="Deposit"
              value={`${formatRupees(listing.depositPaise)}${months ? ` (${months} mo)` : ""}`}
            />
            <Detail label="Posted by" value={listing.postedBy} />
            <Detail label="Room type" value={listing.roomType} />
            <Detail label="Furnishing" value={listing.furnishing} />
            <Detail label="Available" value={listing.availableFrom} />
          </dl>
        </section>
      </div>

      <aside className="space-y-4">
        {error && (
          <div className="rounded-card border border-danger/20 bg-danger-soft p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Owner</h2>
          <p className="mt-2 text-sm text-ink">{row.ownerName}</p>
          <p className="text-xs text-ink-muted">
            Joined {new Date(row.ownerJoinedAt).toLocaleDateString("en-IN")}
          </p>
          <Badge tone="neutral" className="mt-2">
            Trust: {row.ownerTrustLevel}
          </Badge>
        </div>

        {row.flags.length > 0 && (
          <div className="rounded-card border border-warning/20 bg-warning-soft p-4">
            <h2 className="text-sm font-semibold text-warning">
              Worth checking
            </h2>
            <ul className="mt-2 space-y-1.5">
              {row.flags.map((flag) => (
                <li key={flag} className="text-sm text-warning">
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Decision</h2>

          <Button
            fullWidth
            className="mt-3"
            loading={busy}
            onClick={() => act(() => approveListing(listing.id))}
          >
            Approve and host
          </Button>

          <Textarea
            className="mt-4"
            label="Rejection reason"
            hint="Required to reject. Shown to the owner verbatim."
            maxLength={500}
            showCount
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          <Button
            fullWidth
            variant="danger"
            className="mt-2"
            disabled={reason.trim().length < 10}
            loading={busy}
            onClick={() => act(() => rejectListing(listing.id, reason))}
          >
            Reject
          </Button>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}
