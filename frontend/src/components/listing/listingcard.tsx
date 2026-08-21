"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SaveListingButton } from "./savelistingbutton";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { formatRupees } from "@/lib/format/rupees";
import { roomTypeLabels, furnishingLabels } from "@/lib/constants/roomtypes";
import { routes } from "@/lib/constants/routes";
import { useAuthUi } from "@/store/authuistore";
import { startConversation } from "@/lib/api/conversations.client";
import { cn } from "@/lib/utils/classnames";
import type { ListingSummary } from "@/types/listing";

const QUICK_PROMPTS = [
  "Hi, is this room still available?",
  "Hi, can I schedule a visit to see the room?",
  "Hi, what is the deposit and move-in date?",
];

export function ListingCard({
  listing,
  priority = false,
  className,
}: {
  listing: ListingSummary;
  priority?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const user = useAuthUi((state) => state.user);
  const openSignIn = useAuthUi((state) => state.openSignIn);

  // Message modal states
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [message, setMessage] = useState(
    `Hi, I am interested in your room "${listing.title}". Is it still available?`,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentConversationId, setSentConversationId] = useState<string | null>(null);

  // Call modal states
  const [openCallModal, setOpenCallModal] = useState(false);

  function handleChatClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openSignIn({
        intent: `Sign in to message the host about "${listing.title}".`,
        next: routes.listing(listing.slug),
      });
      return;
    }

    setOpenMessageModal(true);
  }

  function handleCallClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openSignIn({
        intent: `Sign in to call the host of "${listing.title}".`,
        next: routes.listing(listing.slug),
      });
      return;
    }

    setOpenCallModal(true);
  }

  async function handleSendMessage(event?: React.FormEvent) {
    if (event) event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || busy) return;

    setBusy(true);
    setError(null);

    try {
      const result = (await startConversation(listing.id, cleanMessage)) as {
        conversation?: { id: string };
        id?: string;
      };
      const createdId = result?.conversation?.id || result?.id || null;
      setSentConversationId(createdId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not send message. Please try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-line bg-surface shadow-2xs",
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
          className,
        )}
      >
        {/* 1. Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-sunken">
          {listing.coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.coverPhoto.url}
              alt={listing.title}
              loading={priority ? "eager" : "lazy"}
              width={listing.coverPhoto.width}
              height={listing.coverPhoto.height}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm font-medium text-ink-subtle">
              No photo
            </div>
          )}

          {/* Photo Count Badge */}
          {listing.photoCount > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/75 backdrop-blur-xs px-2 py-0.5 text-2xs font-semibold text-white shadow-2xs">
              {listing.photoCount} photos
            </span>
          )}

          {/* Save to Wishlist Heart Button */}
          <SaveListingButton
            listingId={listing.id}
            initialSaved={listing.isSaved}
            className="absolute top-2 right-2 size-8.5 bg-white/90 shadow-sm hover:bg-white text-ink-muted hover:text-brand-600"
          />
        </div>

        {/* 2. Card Content Body */}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5">
          <div>
            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-ink">
                {formatRupees(listing.rentPaise || 0)}
              </span>
              <span className="text-xs font-normal text-ink-muted">/month</span>
            </div>

            {/* Room Specs */}
            <p className="mt-1 text-xs sm:text-sm font-medium text-ink-muted line-clamp-1">
              {roomTypeLabels[listing.roomType] || "Room"}
              {listing.furnishing
                ? ` · ${furnishingLabels[listing.furnishing] || ""}`
                : ""}
            </p>

            {/* Title */}
            <h3 className="mt-0.5 text-xs sm:text-sm font-normal text-ink group-hover:text-brand-600 transition-colors">
              <Link
                href={routes.listing(listing.slug)}
                className="after:absolute after:inset-0 after:content-['']"
              >
                <span className="line-clamp-1">{listing.title}</span>
              </Link>
            </h3>
          </div>

          {/* 3. Footer: Location, Date & OLX Action Buttons (Chat & Call) */}
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
            <div className="min-w-0 flex-1 pr-2">
              <p className="truncate text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                {listing.localityName || listing.cityName}
                {listing.cityName && listing.localityName !== listing.cityName
                  ? `, ${listing.cityName}`
                  : ""}
              </p>
              <p className="text-[10px] text-ink-subtle uppercase tracking-wider mt-0.5">
                {formatCardDate(listing.publishedAt)}
              </p>
            </div>

            {/* OLX-Style Call & Chat Buttons */}
            <div className="relative z-10 flex shrink-0 items-center gap-1.5">
              {/* Chat / Message Button */}
              <button
                type="button"
                onClick={handleChatClick}
                title="Message host"
                aria-label="Message host"
                className="flex size-7.5 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 transition-all hover:bg-brand-600 hover:text-white hover:border-brand-600 active:scale-95 shadow-2xs cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                  aria-hidden
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              {/* Call Button */}
              <button
                type="button"
                onClick={handleCallClick}
                title="Call host"
                aria-label="Call host"
                className="flex size-7.5 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 transition-all hover:bg-brand-600 hover:text-white hover:border-brand-600 active:scale-95 shadow-2xs cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* 4. Quick Message Modal */}
      <Modal
        open={openMessageModal}
        onClose={() => {
          if (!busy) {
            setOpenMessageModal(false);
            setSentConversationId(null);
          }
        }}
        title={sentConversationId ? "Message Sent!" : "Message Host"}
        description={
          sentConversationId
            ? `Your message about "${listing.title}" was delivered successfully.`
            : `Ask the host questions or request a visit for "${listing.title}".`
        }
        footer={
          sentConversationId ? (
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setOpenMessageModal(false);
                  setSentConversationId(null);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setOpenMessageModal(false);
                  router.push(
                    sentConversationId
                      ? routes.conversation(sentConversationId)
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
                onClick={() => setOpenMessageModal(false)}
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
        {!sentConversationId ? (
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
              You can now continue chatting with the host in your Inbox.
            </p>
          </div>
        )}
      </Modal>

      {/* 5. Contact Host / Call Modal */}
      <Modal
        open={openCallModal}
        onClose={() => setOpenCallModal(false)}
        title="Contact Host"
        description={`Connect with the host for "${listing.title}".`}
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpenCallModal(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setOpenCallModal(false);
                router.push(routes.listing(listing.slug));
              }}
            >
              View full details
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-card border border-line bg-surface-muted/50 p-3">
            {listing.coverPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.coverPhoto.url}
                alt={listing.title}
                className="size-14 rounded-md object-cover"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-md bg-brand-100 text-xs font-semibold text-brand-700">
                Room
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-ink">
                {listing.title}
              </h4>
              <p className="text-xs font-bold text-brand-600">
                {formatRupees(listing.rentPaise || 0)} /month
              </p>
              <p className="text-xs text-ink-muted truncate">
                {listing.localityName}, {listing.cityName}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {/* Quick Action 1: Direct Message */}
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                setOpenCallModal(false);
                setOpenMessageModal(true);
              }}
              className="flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Send instant message
            </Button>

            {/* Quick Action 2: View Details & Host Contact */}
            <Button
              fullWidth
              onClick={() => {
                setOpenCallModal(false);
                router.push(routes.listing(listing.slug));
              }}
              className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 font-semibold"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Open room & contact host
            </Button>
          </div>

          <div className="rounded-card border border-warning/30 bg-warning-soft p-3 text-xs text-ink-muted">
            ⚠️ <strong>Safety Reminder:</strong> RoomBazar never collects rent or booking deposits upfront. Always inspect the room before paying.
          </div>
        </div>
      </Modal>
    </>
  );
}

function formatCardDate(dateStr?: string): string {
  if (!dateStr) return "RECENT";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  if (diffDays < 30) {
    return date
      .toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
      .toUpperCase();
  }
  return date
    .toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    })
    .toUpperCase();
}
