import type { Metadata, Viewport } from "next";
import { SiteStructuredData } from "@/components/common/structureddata";
import { SignInLauncher } from "@/components/auth/signinlauncher";
import { AuthModal } from "@/components/auth/authmodal";
import { AuthProvider } from "@/providers/authprovider";
import { siteUrl, siteName, siteDescription } from "@/lib/seo/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — rooms for rent, direct from owners`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_IN",
    title: `${siteName} — rooms for rent, direct from owners`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — rooms for rent, direct from owners`,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2551eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en-IN">
        <body>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-inverse"
          >
            Skip to content
          </a>

          <SiteStructuredData />
          <SignInLauncher />
          <AuthModal />

          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
