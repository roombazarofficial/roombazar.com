"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/emptystate";
import { buttonStyles } from "@/components/ui/button";
import { getConversationsClient } from "@/lib/api/conversations.client";
import { chatSocket } from "@/lib/realtime/chat";
import { relativeTime } from "@/lib/format/dates";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";
import type { Conversation } from "@/types/conversation";

export function InboxList({ initial }: { initial: Conversation[] }) {
  const [conversations, setConversations] = useState(initial);

  useEffect(() => {
    const socket = chatSocket();
    const refresh = () => {
      void getConversationsClient().then(setConversations);
    };
    socket.on("conversation:changed", refresh);
    socket.connect();
    return () => {
      socket.off("conversation:changed", refresh);
    };
  }, []);

  if (conversations.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        title="No messages yet"
        description="When someone asks about one of your rooms, the conversation appears here."
        action={<Link href={routes.rooms} className={buttonStyles({ variant: "secondary" })}>Browse rooms</Link>}
      />
    );
  }

  return (
    <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <Link href={routes.conversation(conversation.id)} className="flex gap-4 p-4 transition-colors hover:bg-surface-muted">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-ink">{conversation.counterpartName}</p>
                {conversation.unreadCount > 0 && <Badge tone="brand">{conversation.unreadCount} new</Badge>}
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {conversation.listingTitle} · {formatRupees(conversation.listingRentPaise)}/month
              </p>
              <p className="mt-1.5 truncate text-sm text-ink-muted">{conversation.lastMessagePreview}</p>
            </div>
            <time dateTime={conversation.lastMessageAt} className="shrink-0 text-xs text-ink-subtle">
              {relativeTime(conversation.lastMessageAt)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
