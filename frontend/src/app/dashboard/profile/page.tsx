"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const [name, setName] = useState("Priya Raghavan");
  const [about, setAbout] = useState("");

  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Profile
        </h1>

        <p className="mt-1 text-sm text-ink-muted">
          This is what seekers see when they open one of your rooms.
        </p>

      </header>

      <form className="mt-6 space-y-5">
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <Textarea
          label="About you (optional)"
          placeholder="A line or two about yourself. Helps seekers feel comfortable getting in touch."
          maxLength={300}
          showCount
          value={about}
          onChange={(event) => setAbout(event.target.value)}
        />

        <Button>Save changes</Button>

      </form>

      {}
      <section className="mt-8 rounded-card border border-line bg-surface-muted p-4">
        <h2 className="text-sm font-semibold text-ink">
          What your profile never shows
        </h2>

        <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
          <li>Your phone number or email address</li>

          <li>Your address, or the exact location of your rooms</li>

          <li>A star rating — we do not rate people</li>

        </ul>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="success">ID verified</Badge>

          <Badge tone="neutral">Phone verified</Badge>

        </div>

      </section>

    </div>

  );
}
