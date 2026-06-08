import type { Metadata, Viewport } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import V2Animator from "@/components/V2Animator";
import { Analytics } from "@vercel/analytics/react";

// Syne — bold geometric display, very distinctive for headings & hero text
const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Space Grotesk — slightly quirky tech grotesque, stands out from generic sans
const spaceGrotesk = Space_Grotesk({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// JetBrains Mono — best-in-class coding mono for the Python exercises
const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StrikeLab — Options Pricing for High Schoolers",
  description:
    "Learn Black-Scholes, the Greeks, and options pricing by building a real pricing engine in your browser.",
  applicationName: "StrikeLab",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StrikeLab",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full`}
    >
      <body
        className="min-h-screen flex flex-col"
        style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-ui), system-ui, sans-serif" }}
      >
        {/* Global v2 background — same on every page */}
        <div id="v2-bg-grid" className="v2-bg-grid" />
        <div className="v2-bg-vignette" />

        <V2Animator />
        <Nav />
        <main className="flex-1 relative" style={{ zIndex: 1 }}>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
