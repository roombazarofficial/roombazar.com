import { notFound } from "next/navigation";
import { ConversationView } from "@/components/messaging/conversationview";
import { getConversations, getMessages } from "@/lib/api/conversations";
import type { Conversation } from "@/types/conversation";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const [conversations, messages] = await Promise.all([
    getConversations(),
    getMessages(id),
  ]);
  const conversation = conversations.find(
    (item): item is Conversation => item.id === id,
  );

  if (!conversation) notFound();

  return (
    <ConversationView
      initialConversation={conversation}
      initialMessages={messages}
    />
  );
}
