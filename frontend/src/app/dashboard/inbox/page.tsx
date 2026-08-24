import { InboxList } from "@/components/messaging/inboxlist";
import { getConversations } from "@/lib/api/conversations";

export default async function Page() {
  const conversations = await getConversations();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Inbox</h1>
      <InboxList initial={conversations} />
    </div>
  );
}
