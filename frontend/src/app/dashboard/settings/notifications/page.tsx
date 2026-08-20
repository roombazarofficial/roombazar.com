"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [savedSearchFrequency, setSavedSearchFrequency] = useState("daily");

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

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Messages</h2>

        <div className="mt-2 space-y-0.5">
          <Checkbox label="Notify me by SMS when someone messages me" defaultChecked />
          <Checkbox label="Notify me by email when someone messages me" defaultChecked />
        </div>

        <p className="mt-1.5 px-2 text-xs text-ink-subtle">
          At least one channel stays on so you do not miss enquiries.
        </p>

      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Your listings</h2>

        <div className="mt-2 space-y-0.5">
          <Checkbox label="Remind me before a listing expires" defaultChecked />
          <Checkbox label="Tell me when a listing is approved or needs a fix" defaultChecked />
          <Checkbox label="Weekly summary of views and enquiries" />
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

      <Button className="mt-8">Save preferences</Button>

    </div>

  );
}
