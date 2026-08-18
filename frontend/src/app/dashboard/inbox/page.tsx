import Link from "next/link";
import { EmptyState } from "@/components/ui/emptystate";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { getConversations } from "@/lib/api/conversations";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

export default async function Page() {
  const conversations = await getConversations();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Inbox</h1>

      {conversations.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No messages yet"
          description="When someone asks about one of your rooms, the conversation appears here."
          action={
            <Link href={routes.rooms} className={buttonStyles({ variant: "secondary" })}>
              Browse rooms
            </Link>

          }
        />

      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={routes.conversation(conversation.id)}
                className="flex gap-4 p-4 transition-colors hover:bg-surface-muted"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">
                      {conversation.counterpartName}
                    </p>

                    {conversation.unreadCount > 0 && (
                      <Badge tone="brand">{conversation.unreadCount} new</Badge>

                    )}
                  </div>

                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {conversation.listingTitle} ·{" "}
                    {formatRupees(conversation.listingRentPaise)}/month

                  </p>

                  <p className="mt-1.5 truncate text-sm text-ink-muted">
                    {conversation.lastMessagePreview}
                  </p>

                </div>

                <time
                  dateTime={conversation.lastMessageAt}
                  className="shrink-0 text-xs text-ink-subtle"
                >
                  {relative(conversation.lastMessageAt)}
                </time>

              </Link>

            </li>

          ))}
        </ul>

      )}
    </div>

  );
}

function relative(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}
