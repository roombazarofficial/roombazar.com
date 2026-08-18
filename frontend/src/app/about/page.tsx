import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { buttonStyles } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "How RoomBazar works",
  description:
    "Why RoomBazar charges no commission, how listers and seekers reach each other, and how we make money.",
};

export default function Page() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          How RoomBazar works
        </h1>

        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Finding a room in an Indian city usually costs one to two months of
          rent in broker fees, paid for little more than a phone number and a
          site visit. We think an introduction is not worth a month of rent.
        </p>

        <Section title="We take no commission">
          <p>
            Rent, deposit and the agreement happen directly between you and the
            other person. We never touch the money, which also means we are
            never a reason for the price to go up.
          </p>

        </Section>

        <Section title="Owners are labelled, agents are not hidden">
          <p>
            Every listing says whether it was posted by the owner, a current
            tenant, or an agent. Seekers can filter to owner-listed rooms only.
            We do not ban agents — that would be unenforceable and would just
            push them into lying — but you always know which you are talking
            to.
          </p>

        </Section>

        <Section title="Your phone number stays yours">
          <p>
            Numbers are never shown on listings or profiles. You message through
            RoomBazar, and numbers are exchanged only when both people agree,
            inside that conversation. Listers do not get cold-called by brokers,
            and seekers do not get their number scraped.
          </p>

        </Section>

        <Section title="How we plan to make money">
          <p>
            Not yet, and never from the transaction. Eventually: optional
            featured placement that is clearly labelled and never outranks a
            filter you set, a paid verification badge at cost, and accounts for
            PG operators managing many rooms.
          </p>

          <p>
            What we will not do is charge seekers to see contact details. It is
            the standard model of the incumbents, and it inverts the entire
            reason this exists.
          </p>

        </Section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={routes.post} className={buttonStyles()}>
            Post a room
          </Link>

          <Link
            href={routes.city("bengaluru")}
            className={buttonStyles({ variant: "secondary" })}
          >
            Find a room
          </Link>

        </div>

      </article>

    </SiteShell>

  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>

      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>

    </section>

  );
}
