import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Staying safe",
  description:
    "How to avoid rental scams, what RoomBazar checks, and what we cannot check for you.",
};

/**
 * This page is deliberately blunt about our limits.
 *
 * A platform that overpromises safety is more dangerous than one that is
 * honest about its boundaries, because users calibrate their own caution
 * against what we claim. See docs/03-trust-and-safety.md.
 */
export default function Page() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Staying safe
        </h1>

        <div className="mt-8 rounded-card border border-warning/20 bg-warning-soft p-5">
          <h2 className="text-base font-semibold text-warning">
            The one rule that matters most
          </h2>
          <p className="mt-2 text-sm text-warning">
            Never pay anyone before visiting the room in person. Not a token
            advance, not a booking fee, not a deposit to hold it. RoomBazar
            never collects money and will never ask you to.
          </p>
        </div>

        <Section title="How the common scam works">
          <p>
            Someone posts an attractive room below the going rate. When you ask
            to visit, they say they are travelling or out of station, and offer
            to hold it if you send a small advance over UPI. Then they stop
            replying.
          </p>
          <p>
            The listing looks real because the photos are real — they were
            taken from somewhere else. The only reliable defence is refusing to
            pay before you have stood in the room.
          </p>
        </Section>

        <Section title="Signs worth pausing over">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Rent noticeably below other rooms in the same locality</li>
            <li>Any reason given for why you cannot visit before paying</li>
            <li>Pressure to decide immediately because others are interested</li>
            <li>A request to move the conversation off RoomBazar straight away</li>
            <li>An account created within the last few days</li>
          </ul>
          <p>
            None of these prove anything on its own. Two or three together are
            worth walking away from.
          </p>
        </Section>

        <Section title="Visiting a room">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Go during daylight and tell someone where you are going</li>
            <li>Take someone with you if you can</li>
            <li>Meet at the property itself, not somewhere else first</li>
            <li>
              Ask to see proof of ownership or the existing rental agreement
              before you commit to anything
            </li>
          </ul>
        </Section>

        <Section title="What we check">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Every account verifies a working phone number</li>
            <li>
              Listings are scanned for duplicate photos, prices far below the
              locality median, and advance-payment language
            </li>
            <li>New accounts and reported listings are reviewed by a person</li>
            <li>
              Listers can verify their government ID and prove ownership of the
              property, shown as badges on the listing
            </li>
          </ul>
        </Section>

        {/*
          Stated as plainly as the reassuring parts. Users need an accurate
          picture of what our checks are worth in order to judge for
          themselves.
        */}
        <Section title="What we cannot check">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              We cannot confirm a room exists without visiting it. Ownership
              verification raises the cost of fraud; it does not remove it.
            </li>
            <li>
              We cannot guarantee your safety at a viewing. We can give you
              guidance and a way to report what happened.
            </li>
            <li>
              We are not part of any rental agreement, and we do not settle
              disputes between a landlord and a tenant after they transact.
            </li>
            <li>
              We cannot fully stop agents from describing themselves as owners.
              Detection and reporting make it costly and unreliable, not
              impossible.
            </li>
          </ul>
        </Section>

        <Section title="Reporting something">
          <p>
            Every listing, profile and conversation has a report option. Scam
            and harassment reports are reviewed within four hours, everything
            else within a day, and we tell you what happened either way.
          </p>
          <p>
            If you have lost money or feel unsafe, report it to the police as
            well — we can act on the account, but we cannot act on the person.
          </p>
        </Section>

        <p className="mt-10 text-sm text-ink-muted">
          Questions about any of this?{" "}
          <Link href={routes.contact} className="text-brand-700 underline hover:text-brand-800">
            Get in touch
          </Link>
          .
        </p>
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
