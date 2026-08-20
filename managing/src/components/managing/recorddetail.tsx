"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getListing,
  getUser,
  type AdminListingDetail,
  type AdminUserDetail,
} from "@/lib/api/superadmin";
import { formatRupees } from "@/lib/format/rupees";

export function ListingRecordDetail({ id }: { id: string }) {
  const [data, setData] = useState<AdminListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getListing(id).then(setData).catch((caught: unknown) =>
      setError(caught instanceof Error ? caught.message : "Could not load listing"),
    );
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!data) return <p className="text-sm text-ink-muted">Loading…</p>;

  const { listing, owner, reportCount } = data;
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{listing.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{listing.slug}</p>
        </div>
        <Badge tone={listing.status === "active" ? "success" : "warning"}>
          {listing.status}
        </Badge>
      </div>
      <dl className="mt-6 grid gap-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-2">
        <Fact label="Rent" value={`${formatRupees(listing.rentPaise)}/month`} />
        <Fact label="Location" value={`${listing.locality?.name ?? "Unknown"} · ${listing.city?.name ?? "Unknown"}`} />
        <Fact label="Owner" value={owner ? `${owner.name} · ${owner.publicEmail}` : "Unknown"} />
        <Fact label="Reports" value={String(reportCount)} />
        <Fact label="Room type" value={listing.roomType} />
        <Fact label="Submitted" value={listing.submittedAt ? new Date(listing.submittedAt).toLocaleString("en-IN") : "Not submitted"} />
      </dl>
      <p className="mt-5 whitespace-pre-line text-sm text-ink-muted">{listing.description}</p>
    </div>
  );
}

export function UserRecordDetail({ id }: { id: string }) {
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUser(id).then(setData).catch((caught: unknown) =>
      setError(caught instanceof Error ? caught.message : "Could not load user"),
    );
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!data) return <p className="text-sm text-ink-muted">Loading…</p>;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{data.user.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">{data.publicEmail}</p>
        </div>
        <Badge tone={data.user.trustLevel === "restricted" ? "danger" : "success"}>
          {data.user.trustLevel}
        </Badge>
      </div>
      <dl className="mt-6 grid gap-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-2">
        <Fact label="Role" value={data.user.role} />
        <Fact label="Phone" value={data.publicPhone ?? "Not added"} />
        <Fact label="Reports" value={String(data.reportCount)} />
        <Fact label="Joined" value={new Date(data.user.createdAt).toLocaleString("en-IN")} />
        {Object.entries(data.listingCounts).map(([status, count]) => (
          <Fact key={status} label={`${status} listings`} value={String(count)} />
        ))}
      </dl>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-danger/20 bg-danger-soft p-4 text-sm text-danger">
      {message}
    </div>
  );
}
