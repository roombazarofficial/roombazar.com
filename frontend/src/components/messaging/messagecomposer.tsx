"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Matches phone numbers, emails and messaging handles well enough that
 *  evading it has to be deliberate — and deliberate evasion is itself a
 *  reportable signal. The server runs the authoritative version. */
const contactPattern =
  /(\+?\d[\d\s-]{8,})|([\w.-]+@[\w.-]+\.\w+)|(\b(whatsapp|telegram|insta|instagram)\b)/i;

export function MessageComposer({ contactShared }: { contactShared: boolean }) {
  const [body, setBody] = useState("");

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
        onSubmit={(event) => {
          event.preventDefault();
          setBody("");
        }}
      >
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={1}
          placeholder="Write a message"
          className="max-h-32 min-h-11 flex-1 resize-y rounded-control border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <Button type="submit" disabled={!body.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
