"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MessagePayload } from "firebase/messaging";
import { useAuthUi } from "@/store/authuistore";
import { Button } from "@/components/ui/button";
import { onForegroundMessage } from "@/lib/firebase/messaging";
import { usePushNotifications } from "./usepushnotifications";

/**
 * Mounted once inside the dashboard shell. Three jobs:
 *  - re-register this browser's push token when permission is already granted
 *  - show the soft "Enable notifications" prompt (never auto-requests)
 *  - render foreground messages as an in-app toast instead of a duplicate
 *    browser notification
 */
export function NotificationCenter() {
  const user = useAuthUi((s) => s.user);
  const signedIn = Boolean(user);
  const push = usePushNotifications(signedIn);

  if (!signedIn) return null;

  return (
    <>
      {push.showPrompt && (
        <NotificationPrompt
          busy={push.busy}
          onEnable={push.enable}
          onDismiss={push.dismissPrompt}
        />
      )}
      {push.registered && <ForegroundToasts />}
    </>
  );
}

function NotificationPrompt({
  busy,
  onEnable,
  onDismiss,
}: {
  busy: boolean;
  onEnable: () => Promise<boolean>;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-card border border-line bg-surface p-4 shadow-overlay md:left-auto md:right-4 md:mx-0">
      <p className="text-sm font-semibold text-ink">
        Stay updated with RoomBazar 🔔
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        Get notified about new messages, enquiries, listing updates and important
        RoomBazar activity.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          loading={busy}
          onClick={() => {
            void onEnable();
          }}
        >
          Enable notifications
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss} disabled={busy}>
          Not now
        </Button>
      </div>
    </div>
  );
}

interface Toast {
  id: number;
  title: string;
  body: string;
  url?: string;
}

function ForegroundToasts() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let cleanup = () => {};
    let mounted = true;

    void onForegroundMessage((payload: MessagePayload) => {
      const data = payload.data ?? {};
      const title = payload.notification?.title ?? data.title ?? "RoomBazar";
      const body = payload.notification?.body ?? data.body ?? "";
      const id = Date.now() + Math.random();
      setToasts((current) => [
        ...current,
        { id, title, body, url: data.url },
      ]);
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 6000);
    }).then((unsub) => {
      if (mounted) cleanup = unsub;
      else unsub();
    });

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => {
            setToasts((current) => current.filter((t) => t.id !== toast.id));
            if (toast.url) router.push(toast.url);
          }}
          className="w-full rounded-card border border-line bg-surface p-3 text-left shadow-overlay transition-colors hover:bg-surface-muted"
        >
          <p className="text-sm font-semibold text-ink">{toast.title}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{toast.body}</p>
        </button>
      ))}
    </div>
  );
}
