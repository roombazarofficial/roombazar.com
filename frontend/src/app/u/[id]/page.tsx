import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { ListingGrid } from "@/components/listing/listinggrid";
import { Badge } from "@/components/ui/badge";
import { mockListings, toSummary } from "@/lib/api/mockdata";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const lister = mockListings.find((listing) => listing.lister.id === id)?.lister;
  if (!lister) return {};

  return {
    title: `${lister.name} on RoomBazar`,
    // No index: a profile page adds nothing to search and gives scrapers a
    // convenient per-user endpoint.
    robots: { index: false, follow: false },
  };
}

/**
 * Sparse by design. Name, when they joined, what has been verified, and their
 * live rooms — nothing else. No phone, no email, no rating.
 */
export default async function Page({ params }: { params: Params }) {
  const { id } = await params;

  const lister = mockListings.find((listing) => listing.lister.id === id)?.lister;
  if (!lister) notFound();

  const theirListings = mockListings
    .filter((listing) => listing.lister.id === id && listing.status === "active")
    .map(toSummary);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-2xl font-semibold text-brand-700">
            {lister.name.charAt(0)}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {lister.name}
            </h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Joined{" "}
              {new Intl.DateTimeFormat("en-IN", {
                month: "long",
                year: "numeric",
              }).format(new Date(lister.joinedAt))}
            </p>
          </div>
        </header>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {lister.verifications.includes("ownership") && (
            <Badge tone="success">Ownership verified</Badge>
          )}
          {lister.verifications.includes("governmentid") && (
            <Badge tone="success">ID verified</Badge>
          )}
          {lister.verifications.includes("phone") && (
            <Badge tone="neutral">Phone verified</Badge>
          )}
          {lister.typicalReplyHours != null && (
            <Badge tone="info">
              Usually replies within {lister.typicalReplyHours}h
            </Badge>
          )}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-ink">
            {theirListings.length} live{" "}
            {theirListings.length === 1 ? "room" : "rooms"}
          </h2>
          <ListingGrid listings={theirListings} />
        </section>
      </div>
    </SiteShell>
  );
}
