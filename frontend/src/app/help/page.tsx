import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { LegalPage } from "@/components/common/legalpage";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Answers to common questions about listing, searching and messaging.",
};

export default function Page() {
  return (
    <SiteShell>
      <LegalPage title="Help centre" lastUpdated="16 August 2026">
        <p>
          <strong>Is RoomBazar free?</strong> Yes. Listing is free, searching
          is free, and there is no commission on either side.
        </p>
        <p>
          <strong>Why can I not see a phone number?</strong> Numbers are
          exchanged inside a conversation once both people agree. This stops
          listings becoming a scraped list of phone numbers.
        </p>
        <p>
          <strong>How long does a listing stay live?</strong> Thirty days. We
          remind you before it expires and you can renew in one tap.
        </p>
        <p>
          <strong>My locality is not in the list.</strong> Ask us to add it and
          we will review the request.
        </p>
      </LegalPage>
    </SiteShell>
  );
}
