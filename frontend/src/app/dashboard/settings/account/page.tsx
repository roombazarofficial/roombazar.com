"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Account
        </h1>

      </header>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Phone number</h2>

        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface p-4">
          <span className="text-sm text-ink">+91 98765 43210</span>

          <Badge tone="success">Verified</Badge>

          <Button size="sm" variant="secondary" className="ml-auto">
            Change
          </Button>

        </div>

        <p className="mt-1.5 text-xs text-ink-muted">
          This is how you sign in. Changing it requires verifying the new number
          before the old one stops working.
        </p>

      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Email address</h2>

        <p className="mt-1 text-sm text-ink-muted">
          Optional. Used for alerts and to help recover your account.
        </p>

        <div className="mt-3 flex items-end gap-2">
          <Input type="email" placeholder="you@example.com" autoComplete="email" />
          <Button variant="secondary">Add</Button>

        </div>

      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Your data</h2>

        <p className="mt-1 text-sm text-ink-muted">
          Download everything we hold about you — your profile, listings,
          photos and messages.
        </p>

        <Button variant="secondary" className="mt-3">
          Request my data
        </Button>

      </section>

    </div>

  );
}
