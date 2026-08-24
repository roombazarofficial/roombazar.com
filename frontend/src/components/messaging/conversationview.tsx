"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ContactRevealPanel } from "./contactrevealpanel";
import { MessageThread } from "./messagethread";
import { MessageComposer } from "./messagecomposer";
import { BlockUserButton } from "./blockuserbutton";
import {
  getConversationsClient,
  getMessagesClient,
  markConversationRead,
} from "@/lib/api/conversations.client";
import { fetchCurrentUser } from "@/lib/api/auth";
import { chatSocket, type ConversationChangedEvent } from "@/lib/realtime/chat";
import { formatRupees } from "@/lib/format/rupees";
import { routes } from "@/lib/constants/routes";
import { useAuthUi } from "@/store/authuistore";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";

export function ConversationView({
  initialConversation,
  initialMessages,
}: {
  initialConversation: Conversation;
  initialMessages: Message[];
}) {
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const user = useAuthUi((state) => state.user);
  const setUser = useAuthUi((state) => state.setUser);

  const refresh = useCallback(async () => {
    const [conversations, nextMessages] = await Promise.all([
      getConversationsClient(),
      getMessagesClient(initialConversation.id),
    ]);
    const nextConversation = conversations.find(
      (item) => item.id === initialConversation.id,
    );
    if (nextConversation) setConversation(nextConversation);
    setMessages(nextMessages);
  }, [initialConversation.id]);

  const markReadAndRefreshBadge = useCallback(async () => {
    await markConversationRead(initialConversation.id).catch(() => undefined);
    const current = await fetchCurrentUser();
    if (current) setUser(current);
  }, [initialConversation.id, setUser]);

  useEffect(() => {
    const socket = chatSocket();
    const onChange = (event: ConversationChangedEvent) => {
      if (event.conversationId !== initialConversation.id) return;
      void refresh().then(() => {
        if (event.reason === "message") return markReadAndRefreshBadge();
      });
    };

    socket.on("conversation:changed", onChange);
    socket.connect();
    void markReadAndRefreshBadge();

    return () => {
      socket.off("conversation:changed", onChange);
    };
  }, [initialConversation.id, markReadAndRefreshBadge, refresh]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex min-w-0 flex-col rounded-card border border-line bg-surface">
        <header className="border-b border-line p-4">
          <p className="text-sm font-medium text-ink">{conversation.counterpartName}</p>
          <Link
            href={routes.listing(conversation.listingSlug)}
            className="mt-0.5 block truncate text-xs text-ink-muted hover:text-ink"
          >
            {conversation.listingTitle} · {formatRupees(conversation.listingRentPaise)}/month
          </Link>
        </header>

        <MessageThread messages={messages} currentUserId={user?.id ?? null} />
        <MessageComposer
          contactShared={Boolean(conversation.youRevealedAt && conversation.theyRevealedAt)}
          conversationId={conversation.id}
          onMessageSent={refresh}
        />
      </div>

      <aside className="space-y-4">
        <ContactRevealPanel
          conversationId={conversation.id}
          youRevealed={Boolean(conversation.youRevealedAt)}
          theyRevealed={Boolean(conversation.theyRevealedAt)}
          theirName={conversation.counterpartName}
          theirPhone={conversation.counterpartPhone}
          onChanged={refresh}
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
