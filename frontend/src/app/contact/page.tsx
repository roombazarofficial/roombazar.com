import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { LegalPage } from "@/components/common/legalpage";

export const metadata: Metadata = {
  title: "Contact us",
  description: "How to reach the RoomBazar team.",
};

export default function Page() {
  return (
    <SiteShell>
      <LegalPage title="Contact us" lastUpdated="16 August 2026">
        <p>
          For anything urgent involving safety or a scam, use the report button
          on the listing, profile or conversation — those reach the moderation
          queue directly and are reviewed within four hours.
        </p>
        <p>
          For everything else, email <a href="mailto:roombazar.official@gmail.com" className="font-semibold text-brand-600 underline hover:text-brand-700">roombazar.official@gmail.com</a> and we
          will get back to you within two working days.
        </p>
      </LegalPage>
    </SiteShell>
  );
}
