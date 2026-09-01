"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { CurrentUser } from "@/types/user";

export default function Page() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<CurrentUser | null>("/users/me")
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name || "");
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await api.patch<CurrentUser>("/users/me", {
        name: name.trim(),
      });
      setUser(updated);
      setName(updated.name);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const isEmailVerified = Boolean(user?.emailVerifiedAt || user?.verifications?.includes("email"));
  const isPhoneVerified = Boolean(user?.phoneVerifiedAt || user?.verifications?.includes("phone"));

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

      {message && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Name"
          placeholder="Enter your full name"
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

        <Button disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>

      <section className="mt-8 rounded-card border border-line bg-surface-muted p-4">
        <h2 className="text-sm font-semibold text-ink">
          What your profile never shows
        </h2>

        <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
          <li>Your phone number or email address</li>
          <li>Your address, or the exact location of your rooms</li>
          <li>A star rating — we do not rate people</li>
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isEmailVerified ? (
            <Badge tone="success">Email verified</Badge>
          ) : (
            <Badge tone="neutral">Email not verified</Badge>
          )}

          {isPhoneVerified ? (
            <Badge tone="success">Phone verified</Badge>
          ) : (
            <Badge tone="neutral">Phone not verified</Badge>
          )}

          {user?.verifications?.includes("governmentid") && (
            <Badge tone="success">ID verified</Badge>
          )}
        </div>
      </section>
    </div>
  );
}
