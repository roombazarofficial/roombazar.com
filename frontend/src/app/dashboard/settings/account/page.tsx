"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/lib/api/auth";
import { useAuthUi } from "@/store/authuistore";

export default function Page() {
  const user = useAuthUi((state) => state.user);
  const setUser = useAuthUi((state) => state.setUser);
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setPhone(user?.phone ?? ""), [user?.phone]);

  async function savePhone() {
    setPending(true);
    setMessage(null);
    try {
      const updated = await updateProfile({ phone: phone.trim() || null });
      setUser(updated);
      setMessage("Phone number saved. You can now use mutual contact sharing.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not save phone number");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <header><h1 className="text-2xl font-semibold tracking-tight text-ink">Account</h1></header>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Phone number</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Required only when you choose to share contact details in a conversation.
        </p>
        <div className="mt-3 flex items-end gap-2">
          <Input
            label="Indian mobile number"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            placeholder="9876543210"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
          />
          <Button
            variant="secondary"
            loading={pending}
            disabled={!/^[6-9]\d{9}$/.test(phone)}
            onClick={() => void savePhone()}
          >
            Save
          </Button>
        </div>
        <div className="mt-2">
          <Badge tone={user?.phoneVerifiedAt ? "success" : "neutral"}>
            {user?.phoneVerifiedAt ? "Verified" : "Not verified"}
          </Badge>
        </div>
        {message && <p className="mt-2 text-sm text-ink-muted">{message}</p>}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Email address</h2>
        <p className="mt-1 text-sm text-ink-muted">{user?.email ?? "No email available"}</p>
      </section>
    </div>
  );
}
