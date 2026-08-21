"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { ReportListingButton } from "./reportlistingbutton";
import { ShareListingButton } from "./sharelistingbutton";
import { formatRupees } from "@/lib/format/rupees";
import { useAuthUi } from "@/store/authuistore";
import { startConversation } from "@/lib/api/conversations.client";
import { routes } from "@/lib/constants/routes";
import type { Listing } from "@/types/listing";

const QUICK_PROMPTS = [
  "Hi, is this room still available?",
  "Hi, can I schedule a visit to see the room?",
  "Hi, are electricity and water bills included in the rent?",
];

export function ListingListerPanel({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { lister } = listing;
  const isLive = listing.status === "active";

  const user = useAuthUi((state) => state.user);
  const openSignIn = useAuthUi((state) => state.openSignIn);

  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState(
    `Hi, I am interested in your room "${listing.title}". Is it still available?`,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const isOwner = Boolean(user && user.id === listing.lister.id);

  function handleMessageClick() {
    if (!user) {
      openSignIn({
        intent: `Sign in to message ${lister.name} about this room.`,
        next: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      return;
    }

    setOpenModal(true);
  }

  async function handleSendMessage(event?: React.FormEvent) {
    if (event) event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || busy) return;

    setBusy(true);
    setError(null);

    try {
      const result = await startConversation(listing.id, cleanMessage) as {
        conversation?: { id: string };
        id?: string;
      };
      const createdId = result?.conversation?.id || result?.id || null;
      setConversationId(createdId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not send your message. Please check your connection and try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-semibold text-brand-700">
          {lister.name.charAt(0)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{lister.name}</p>
          <p className="text-xs text-ink-muted">{joinedLabel(lister.joinedAt)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lister.verifications.includes("ownership") && (
          <Badge tone="success">Ownership verified</Badge>
        )}
        {lister.verifications.includes("governmentid") && (
          <Badge tone="success">ID verified</Badge>
        )}
        {lister.verifications.includes("phone") && (
          <Badge tone="neutral">Phone verified</Badge>
        )}
      </div>

      {lister.typicalReplyHours != null && (
        <p className="mt-3 text-xs text-ink-muted">
          Usually replies within {lister.typicalReplyHours} hours
        </p>
      )}

      {isLive ? (
        <>
          {isOwner ? (
            <div className="mt-5 space-y-2">
              <Link
                href={routes.myListing(listing.id)}
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className: "w-full text-center",
                })}
              >
                Manage your listing
              </Link>
              <p className="text-center text-xs text-ink-muted">
                You posted this room listing.
              </p>
            </div>
          ) : (
            <>
              <Button
                fullWidth
                size="lg"
                onClick={handleMessageClick}
                className="mt-5 bg-brand-600 hover:bg-brand-700 font-semibold"
              >
                Message about this room
              </Button>

              <p className="mt-2 text-center text-xs text-ink-subtle">
                Your phone number stays private until you both choose to share it.
              </p>
            </>
          )}

          <ShareListingButton
            slug={listing.slug}
            title={listing.title}
            rent={formatRupees(listing.rentPaise)}
          />
        </>
      ) : (
        <p className="mt-5 rounded-control bg-surface-muted px-3 py-2.5 text-center text-sm text-ink-muted">
          This listing is closed
        </p>
      )}

      <div className="mt-4">
        <ReportListingButton listingId={listing.id} />
      </div>

      {/* Message Host Modal */}
      <Modal
        open={openModal}
        onClose={() => {
          if (!busy) {
            setOpenModal(false);
            setConversationId(null);
          }
        }}
        title={conversationId ? "Message sent!" : `Message ${lister.name}`}
        description={
          conversationId
            ? `Your message about "${listing.title}" has been delivered to ${lister.name}.`
            : `Ask questions or arrange a visit for "${listing.title}".`
        }
        footer={
          conversationId ? (
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setOpenModal(false);
                  setConversationId(null);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setOpenModal(false);
                  router.push(
                    conversationId
                      ? routes.conversation(conversationId)
                      : routes.inbox,
                  );
                }}
              >
                Go to chat
              </Button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <Button
                loading={busy}
                disabled={!message.trim() || busy}
                onClick={() => void handleSendMessage()}
              >
                Send message
              </Button>
            </div>
          )
        }
      >
        {!conversationId ? (
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-ink-muted">Quick templates:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    className="rounded-full border border-line bg-surface-muted/60 px-2.5 py-1 text-xs text-ink hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Your message"
              rows={4}
              maxLength={1000}
              showCount
              required
              value={message}
              error={error ?? undefined}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Type your message here..."
            />

            <div className="rounded-card border border-line bg-surface-muted/40 p-3 text-xs text-ink-muted">
              🔒 <strong>Safe Contact:</strong> RoomBazar protects your privacy. Never send payments or advances before seeing the room in person.
            </div>
          </form>
        ) : (
          <div className="py-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success text-2xl">
              ✓
            </div>
            <p className="mt-3 text-sm text-ink font-medium">
              You can now chat directly with {lister.name} in your Inbox.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function joinedLabel(joinedAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days < 1) return "Joined today";
  if (days < 30) return `Joined ${days} days ago`;
  if (days < 365) return `Joined ${Math.floor(days / 30)} months ago`;
  return `Joined ${Math.floor(days / 365)} years ago`;
}
