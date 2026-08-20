import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptystate";
import { getConversations } from "@/lib/api/conversations";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const conversations = await getConversations();

  const waiting = conversations.filter(
    (conversation) => conversation.unreadCount > 0,
  );
  const rest = conversations.filter(
    (conversation) => conversation.unreadCount === 0,
  );

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Enquiries
        </h1>

        <p className="mt-1 text-sm text-ink-muted">
          People asking about your rooms, newest first.
        </p>

      </header>

      {conversations.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No enquiries yet"
          description="When someone asks about one of your rooms it will show up here, and we will message you."
          action={
            <Link
              href={routes.myListings}
              className={buttonStyles({ variant: "secondary" })}
            >
              Check your listings
            </Link>

          }
        />

      ) : (
        <div className="mt-6 space-y-8">
          {waiting.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-ink">
                Waiting for your reply ({waiting.length})
              </h2>

              <ul className="space-y-3">
                {waiting.map((conversation) => (
                  <Row key={conversation.id} conversation={conversation} />

                ))}
              </ul>

            </section>

          )}

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-ink">Replied</h2>

              <ul className="space-y-3">
                {rest.map((conversation) => (
                  <Row key={conversation.id} conversation={conversation} />

                ))}
              </ul>

            </section>

          )}
        </div>

      )}
    </div>

  );
}

function Row({
  conversation,
}: {
  conversation: Awaited<ReturnType<typeof getConversations>>[number];
}) {
  return (
    <li className="rounded-card border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-ink">
              {conversation.counterpartName}
            </p>

            {conversation.unreadCount > 0 && (
              <Badge tone="brand">{conversation.unreadCount} new</Badge>

            )}
          </div>

          <p className="mt-1 text-xs text-ink-muted">
            About: {conversation.listingTitle} ·{" "}
            {formatRupees(conversation.listingRentPaise)}/month

          </p>

          <p className="mt-2 text-sm text-ink-muted">
            {conversation.lastMessagePreview}
          </p>

        </div>

        <time
          dateTime={conversation.lastMessageAt}
          className="shrink-0 text-xs text-ink-subtle"
        >
          {relative(conversation.lastMessageAt)}
        </time>

      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={routes.conversation(conversation.id)}
          className={buttonStyles({ size: "sm" })}
        >
          {conversation.unreadCount > 0 ? "Reply" : "Open conversation"}
        </Link>

      </div>

    </li>

  );
}

function relative(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}
