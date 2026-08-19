import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Safety tips",
  description:
    "Practical safety advice for renting rooms in Indian cities: what to verify, how to avoid scams, and why you should never pay before visiting.",
};

export default function Page() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Safety tips
        </h1>
        <p className="mt-3 text-base text-ink-muted">
          Practical advice for finding and visiting rooms safely in Indian cities.
        </p>

        <div className="mt-8 rounded-card border border-brand-200 bg-brand-50 p-5">
          <h2 className="text-base font-semibold text-brand-800">
            The #1 golden rule of room renting
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-900">
            <strong>Never transfer advance money, token amounts, or gate fees before physically visiting the room.</strong>{" "}
            RoomBazar is a direct discovery platform — we never collect rent or deposits, and we never ask for your bank details or UPI PIN.
          </p>
        </div>

        <Section title="1. Before visiting a room">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Check market rents:</strong> If a 1 BHK in Indiranagar is listed for ₹5,000 when the locality average is ₹20,000+, treat it with high caution.</li>
            <li><strong>Keep conversations on RoomBazar:</strong> Use the in-app chat first. Do not immediately move to external apps before checking basic details.</li>
            <li><strong>Schedule daylight visits:</strong> Always plan your site visits during daylight hours so you can inspect natural light, surroundings, and neighbourhood safety.</li>
            <li><strong>Share your location:</strong> Let a friend or flatmate know the address and time of your scheduled visit.</li>
          </ul>
        </Section>

        <Section title="2. During the property visit">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Inspect essentials:</strong> Check water pressure, geysers, power backup, mobile network reception inside the room, and door/window locks.</li>
            <li><strong>Confirm bill inclusions:</strong> Ask clearly whether electricity, water, Wi-Fi, and maintenance charges are included in the monthly rent.</li>
            <li><strong>Meet the actual owner or flatmates:</strong> Verify whether the person showing the room is the property owner, a sub-letting tenant, or an agent.</li>
            <li><strong>Ask about house rules:</strong> Understand guest policies, notice periods, gate timings, and deposit refund terms upfront.</li>
          </ul>
        </Section>

        <Section title="3. Before paying any deposit or advance">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Verify ownership documents:</strong> Ask for electricity bill or property tax receipt in the owner&apos;s name before signing a rental agreement.</li>
            <li><strong>Written rental agreement:</strong> Always insist on a written 11-month agreement stating the exact monthly rent, security deposit amount, notice period, and maintenance terms.</li>
            <li><strong>Always get written receipts:</strong> Pay security deposits via traceable banking channels (NEFT/UPI/IMPS) and collect a signed rent receipt or acknowledgement.</li>
          </ul>
        </Section>

        <Section title="4. How to spot common rental scams">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>&quot;Out of town / Army officer&quot; story:</strong> Scammers often claim they are deployed or travelling and ask for a refundable &quot;visiting pass&quot; or token fee via UPI QR code. Legitimate owners never ask for money to let you see a room.</li>
            <li><strong>Urgency pressure:</strong> Beware of listers claiming 10 other people are transferring right now and demanding an instant deposit.</li>
            <li><strong>Fake gate pass / security deposit QR:</strong> Never scan a QR code to &quot;receive&quot; a visit pass. Scanning a QR code always debits your account.</li>
          </ul>
        </Section>

        <Section title="5. Reporting suspicious listings">
          <p>
            If you encounter bait pricing, a broker posing as an owner, harassment, or someone asking for pre-visit payments, use the <strong>Report listing</strong> button immediately.
          </p>
          <p className="mt-2">
            Our moderation team reviews reports daily and suspends fraudulent accounts to keep the marketplace safe for genuine seekers.
          </p>
        </Section>

        <div className="mt-12 rounded-card border border-line bg-surface-muted p-5">
          <p className="text-sm text-ink-muted">
            Have questions or need assistance?{" "}
            <Link href={routes.contact} className="font-medium text-brand-600 underline hover:text-brand-700">
              Contact our team
            </Link>
            .
          </p>
        </div>
      </article>
    </SiteShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}
