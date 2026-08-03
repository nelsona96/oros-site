import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { LocalBusinessJsonLd } from "@/components/local-business-jsonld";
import { getSiteSettings } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_DESCRIPTION } from "@/lib/metadata";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Oros Productions",
    template: "%s | Oros Productions",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    siteName: "Oros Productions",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={cn("dark", fraunces.variable, instrumentSans.variable, ibmPlexMono.variable)}
    >
      {/*
       * flex min-h-dvh + main's flex-1 is the sticky-footer pattern: main
       * grows to fill any leftover viewport height on a short page, pushing
       * Footer down to the bottom instead of leaving it stranded partway up
       * (Header is `fixed`, so it's out of flow and unaffected either way).
       */}
      <body className="flex min-h-dvh flex-col">
        <Header />
        {/*
         * pt-20 clears the fixed header for ordinary pages. Phase 6's hero
         * renders full-bleed under the transparent header instead, so it
         * will opt out of this padding on its own page.
         */}
        <main className="flex-1 pt-20">{children}</main>
        <Footer settings={settings} />
        <Toaster />
        <LocalBusinessJsonLd settings={settings} />
        <Analytics />
      </body>
    </html>
  );
}
