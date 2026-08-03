import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RouteFocusManager } from "@/components/route-focus-manager";
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

// theme-color moved out of `metadata` per Next's own deprecation notice —
// this Next version wants it on a separate `viewport` export instead.
// #111110 is --app-bg / sand-1, matching app/icon.svg's apple-icon treatment.
export const viewport: Viewport = {
  themeColor: "#111110",
  colorScheme: "dark",
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
        <a
          href="#main-content"
          className="bg-app-bg text-text-primary ring-focus-ring rounded-control sr-only px-4 py-2 font-mono text-xs tracking-widest uppercase focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:ring-2"
        >
          Skip to content
        </a>
        <Header />
        {/*
         * pt-20 clears the fixed header for ordinary pages. Phase 6's hero
         * renders full-bleed under the transparent header instead, so it
         * will opt out of this padding on its own page. tabIndex=-1 + no
         * visible outline: this is a landmark-focus target for the skip
         * link and route-change focus management (RouteFocusManager), not a
         * real interactive control, so it shouldn't show a focus ring of
         * its own.
         */}
        <main id="main-content" tabIndex={-1} className="flex-1 pt-20 outline-none">
          {children}
        </main>
        <Footer settings={settings} />
        <Toaster />
        <LocalBusinessJsonLd settings={settings} />
        <RouteFocusManager />
        <Analytics />
      </body>
    </html>
  );
}
