import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Oros Productions",
  description:
    "Photography and videography for weddings, commercial work, portraiture, and ministry film.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", instrumentSerif.variable, instrumentSans.variable, ibmPlexMono.variable)}
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
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
