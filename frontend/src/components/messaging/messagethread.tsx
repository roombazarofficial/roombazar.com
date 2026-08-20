import { cn } from "@/lib/utils/classnames";
import type { Message } from "@/types/message";

export function MessageThread({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.map((message) => {
        const mine = message.senderId === "me";

        return (
          <div
            key={message.id}
            className={cn("flex", mine ? "justify-end" : "justify-start")}
          >
            <div className="max-w-[80%]">
              <div
                className={cn(
                  "rounded-sheet px-3.5 py-2.5 text-sm",
                  mine
                    ? "bg-brand-600 text-ink-inverse"
                    : "bg-surface-muted text-ink",
                )}
              >
                {message.body}
              </div>

              {}
              {message.redacted && (
                <p className="mt-1 text-2xs text-ink-subtle">
                  Contact details are hidden until you both agree to share them
                </p>

              )}

              <time
                dateTime={message.sentAt}
                className={cn(
                  "mt-1 block text-2xs text-ink-subtle",
                  mine && "text-right",
                )}
              >
                {new Intl.DateTimeFormat("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(message.sentAt))}
              </time>

            </div>

          </div>

        );
      })}
    </div>

  );
}
