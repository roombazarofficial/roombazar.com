"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/api/conversations.client";

const contactPattern =
  /(\+?\d[\d\s-]{8,})|([\w.-]+@[\w.-]+\.\w+)|(\b(whatsapp|telegram|insta|instagram)\b)/i;

export function MessageComposer({
  contactShared,
  conversationId,
  onMessageSent,
}: {
  contactShared: boolean;
  conversationId: string;
  onMessageSent?: () => void;
}) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wouldRedact = !contactShared && contactPattern.test(body);

  return (
    <div className="border-t border-line p-3">
      {wouldRedact && (
        <p className="mb-2 rounded-control bg-warning-soft px-3 py-2 text-xs text-warning">
          Contact details will be hidden until you both agree to share numbers.
        </p>
      )}

      <form
        className="flex items-end gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const trimmed = body.trim();
          if (!trimmed || !conversationId || pending) return;

          setPending(true);
          setError(null);
          try {
            await sendMessage(conversationId, trimmed);
            setBody("");
            await onMessageSent?.();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not send message");
          } finally {
            setPending(false);
          }
        }}
      >
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={1}
          placeholder="Write a message"
          className="max-h-32 min-h-11 flex-1 resize-y rounded-control border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />

        <Button type="submit" disabled={!body.trim()} loading={pending}>
          Send
        </Button>

      </form>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

    </div>
  );
}
