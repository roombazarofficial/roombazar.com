import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ConsoleFrame } from "@/components/managing/consoleframe";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Root layout for the management console.
 *
 * A separate Next.js application from the public site, deployed to its own
 * hostname. That separation is the point: cookies scoped here are never sent to
 * the public site, so an XSS in a listing description cannot reach an operator
 * session — the failure that turns a content bug into a full takeover.
 */
export const metadata: Metadata = {
  title: {
    default: "RoomBazar management",
    template: "%s | RoomBazar management",
  },
  description: "Internal console.",
  /*
    Never indexed. This is enforced again by a header in middleware, because a
    console on a real hostname will be found by something eventually and one of
    the two should hold.
  */
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className={inter.className}>
        <ConsoleFrame>{children}</ConsoleFrame>
      </body>
    </html>
  );
}
