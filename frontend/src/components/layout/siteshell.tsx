import { SiteHeader } from "./siteheader";
import { SiteFooter } from "./sitefooter";
import { WelcomeOfferPopup } from "@/components/common/welcomeofferpopup";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WelcomeOfferPopup />
    </div>
  );
}
