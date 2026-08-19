import { notFound } from "next/navigation";
import Link from "next/link";
import { ContactRevealPanel } from "@/components/messaging/contactrevealpanel";
import { MessageThread } from "@/components/messaging/messagethread";
import { MessageComposer } from "@/components/messaging/messagecomposer";
import { BlockUserButton } from "@/components/messaging/blockuserbutton";
import { mockConversations, mockMessages } from "@/lib/api/mockconversations";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;

  const conversation = mockConversations.find((item) => item.id === id);
  if (!conversation) notFound();

  const messages = mockMessages[id] ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex min-w-0 flex-col rounded-card border border-line bg-surface">
        <header className="border-b border-line p-4">
          <p className="text-sm font-medium text-ink">
            {conversation.counterpartName}
          </p>
          <Link
            href={routes.listing(conversation.listingSlug)}
            className="mt-0.5 block truncate text-xs text-ink-muted hover:text-ink"
          >
            {conversation.listingTitle} ·{" "}
            {formatRupees(conversation.listingRentPaise)}/month
          </Link>
        </header>

        <MessageThread messages={messages} />
        <MessageComposer
          contactShared={Boolean(
            conversation.youRevealedAt && conversation.theyRevealedAt,
          )}
        />
      </div>

      <aside className="space-y-4">
        <ContactRevealPanel
          youRevealed={Boolean(conversation.youRevealedAt)}
          theyRevealed={Boolean(conversation.theyRevealedAt)}
          theirName={conversation.counterpartName}
          theirPhone={conversation.counterpartPhone}
        />

        <div className="rounded-card border border-line bg-surface p-4">
          <BlockUserButton name={conversation.counterpartName} />
          <button className="mt-2.5 block w-full text-left text-sm text-danger hover:brightness-90">
            Report this conversation
          </button>
        </div>
      </aside>
    </div>
  );
}
