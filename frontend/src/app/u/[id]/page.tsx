import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { Badge } from "@/components/ui/badge";
import { getPublicUser } from "@/lib/api/users";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicUser(id);
  if (!user) return {};

  return {
    title: `${user.name} on RoomBazar`,
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getPublicUser(id);
  if (!user) notFound();

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-2xl font-semibold text-brand-700">
            {user.name.charAt(0)}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {user.name}
            </h1>

            <p className="mt-0.5 text-sm text-ink-muted">
              Joined{" "}
              {new Intl.DateTimeFormat("en-IN", {
                month: "long",
                year: "numeric",
              }).format(new Date(user.joinedAt))}
            </p>

          </div>

        </header>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {user.verifications.includes("ownership") && (
            <Badge tone="success">Ownership verified</Badge>

          )}
          {user.verifications.includes("governmentid") && (
            <Badge tone="success">ID verified</Badge>

          )}
          {user.verifications.includes("phone") && (
            <Badge tone="neutral">Phone verified</Badge>

          )}
          {user.typicalReplyHours != null && (
            <Badge tone="info">
              Usually replies within {user.typicalReplyHours}h
            </Badge>

          )}
        </div>

        <p className="mt-10 text-sm text-ink-muted">
          {user.activeListingCount === 0
            ? "No live rooms right now."
            : `${user.activeListingCount} live ${
                user.activeListingCount === 1 ? "room" : "rooms"
              }.`}
        </p>

      </div>

    </SiteShell>

  );
}
