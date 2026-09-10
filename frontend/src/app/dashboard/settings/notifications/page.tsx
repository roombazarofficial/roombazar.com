"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/components/notifications/usepushnotifications";

const CATEGORY_KEY = "rb_notif_categories";

const categories = [
  { id: "chat", label: "Chat messages", locked: false },
  { id: "enquiries", label: "Property enquiries", locked: false },
  { id: "listings", label: "Listing updates", locked: false },
  { id: "system", label: "Important RoomBazar updates", locked: true },
  { id: "recommendations", label: "Recommendations", locked: false },
  { id: "marketing", label: "Marketing", locked: false },
] as const;

type CategoryId = (typeof categories)[number]["id"];

function readCategories(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(CATEGORY_KEY) ?? "{}") as Record<
      string,
      boolean
    >;
  } catch {
    return {};
  }
}

export default function Page() {
  const push = usePushNotifications(true);
  const [savedSearchFrequency, setSavedSearchFrequency] = useState("daily");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(readCategories());
  }, []);

  function toggle(id: CategoryId) {
    setPrefs((current) => ({ ...current, [id]: !(current[id] ?? true) }));
    setSaved(false);
  }

  function savePrefs() {
    try {
      localStorage.setItem(CATEGORY_KEY, JSON.stringify(prefs));
      setSaved(true);
    } catch {
      /* ignore */
    }
  }

  const browserState = !push.available
    ? "unavailable"
    : push.permission === "denied"
      ? "blocked"
      : push.registered
        ? "on"
        : "off";

  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          We keep these deliberately quiet. You should hear from us when
          something needs you, not otherwise.
        </p>
      </header>

      <section className="mt-8 rounded-card border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Browser notifications
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {browserState === "unavailable" &&
                "Not available in this browser, or push is not configured for this site."}
              {browserState === "blocked" &&
                "Blocked in your browser settings. Allow notifications for roombazar.com, then reload this page."}
              {browserState === "on" &&
                "This device is set up to receive RoomBazar notifications."}
              {browserState === "off" &&
                "Turn on push notifications for this browser."}
            </p>
          </div>
          {browserState === "on" && (
            <Button
              size="sm"
              variant="secondary"
              loading={push.busy}
              onClick={() => void push.disable()}
            >
              Turn off
            </Button>
          )}
          {browserState === "off" && (
            <Button
              size="sm"
              loading={push.busy}
              onClick={() => void push.enable()}
            >
              Turn on
            </Button>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">
          What to notify me about
        </h2>
        <div className="mt-2 space-y-0.5">
          {categories.map((category) => (
            <Checkbox
              key={category.id}
              label={
                category.locked
                  ? `${category.label} (always on)`
                  : category.label
              }
              checked={
                category.locked ? true : (prefs[category.id] ?? true)
              }
              disabled={category.locked}
              onChange={() => toggle(category.id)}
            />
          ))}
        </div>
        <p className="mt-1.5 px-2 text-xs text-ink-subtle">
          Marketing is off unless you turn it on. Security and account notices
          stay on.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Email &amp; SMS</h2>
        <div className="mt-2 space-y-0.5">
          <Checkbox
            label="Notify me by SMS when someone messages me"
            defaultChecked
          />
          <Checkbox
            label="Notify me by email when someone messages me"
            defaultChecked
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Saved searches</h2>
        <Select
          className="mt-2"
          label="How often should we tell you about new matches?"
          options={[
            { value: "instant", label: "As soon as a room matches" },
            { value: "daily", label: "Once a day" },
            { value: "off", label: "Never" },
          ]}
          value={savedSearchFrequency}
          onChange={(event) => setSavedSearchFrequency(event.target.value)}
        />
      </section>

      <div className="mt-8 flex items-center gap-3">
        <Button onClick={savePrefs}>Save preferences</Button>
        {saved && <span className="text-sm text-success">Saved</span>}
      </div>
    </div>
  );
}
