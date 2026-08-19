import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SiteStructuredData } from "@/components/common/structureddata";
import { siteUrl, siteName, siteDescription } from "@/lib/seo/site";
import { SmoothScrollProvider } from "@/providers/smoothscroll";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * The root layout is deliberately neutral: html, body, providers, nothing else.
 *
 * Without route groups, every layout below this one nests inside it, so putting
 * the public header here would leak it into /dashboard and /admin. Public pages
 * therefore opt in to the public chrome by wrapping their content in
 * <SiteShell>, while /dashboard and /admin render their own shells.
 */
export const metadata: Metadata = {
  // Required for relative OG image paths to resolve to absolute URLs. Without
  // it, shared links render with no preview image at all.
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
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#d13421",
  width: "device-width",
  initialScale: 1,
  // Never lock zoom. Pinching to read a rent figure or a photo is exactly
  // what people do on a small screen.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className={inter.className}>
        <SmoothScrollProvider>
          {/*
            First focusable element on the page. Sighted keyboard users would
            otherwise tab through the entire header on every navigation.
          */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-inverse"
          >
            Skip to content
          </a>

          <SiteStructuredData />

          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
