import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/siteshell";
import { LegalPage } from "@/components/common/legalpage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What we collect, why, and the rights you have under the DPDP Act 2023.",
};

export default function Page() {
  return (
    <SiteShell>
      <LegalPage title="Privacy policy" lastUpdated="16 August 2026">
        <p>
          We collect your phone number, anything you put in your profile and
          listings, the photos you upload, and the messages you send through
          the platform. Under the Digital Personal Data Protection Act 2023 we
          are a Data Fiduciary for that information.
        </p>
        <p>
          Your phone number is never shown publicly. It is shared with another
          user only when you and that person have both agreed to share numbers
          inside a conversation.
        </p>
        <p>
          We read message content only for automated safety scanning and when
          investigating a specific report. Deleting your account removes your
          listings, photos and personal fields within 30 days; messages that
          are evidence in an open report are anonymised instead.
        </p>
        <p>
          This is placeholder wording and must be reviewed by a lawyer before
          launch.
        </p>
      </LegalPage>
    </SiteShell>
  );
}
