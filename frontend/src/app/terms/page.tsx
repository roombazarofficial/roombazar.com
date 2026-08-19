import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { LegalPage } from "@/components/common/legalpage";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for using RoomBazar, and the limits of our role.",
};

export default function Page() {
  return (
    <SiteShell>
      <LegalPage title="Terms of use" lastUpdated="16 August 2026">
        <p>
          RoomBazar is a place to advertise and find rooms. We are not a party
          to any rental agreement, we do not handle rent or deposits, and we do
          not act as an agent for either side.
        </p>
        <p>
          You are responsible for the accuracy of anything you post. Listings
          that are not genuinely available, that misrepresent who is posting
          them, or that restrict tenants by caste, religion or region are
          removed, and repeated breaches result in account restrictions.
        </p>
        <p>
          These terms are placeholder wording and must be reviewed by a lawyer
          before launch.
        </p>
      </LegalPage>
    </SiteShell>
  );
}
