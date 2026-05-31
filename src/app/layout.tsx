import type { Metadata } from "next";
import { Geist, EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import V2Animator from "@/components/V2Animator";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });

const garamond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StrikeLab — Options Pricing for High Schoolers",
  description:
    "Learn Black-Scholes, the Greeks, and options pricing by building a real pricing engine in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${garamond.variable} ${jetbrains.variable} h-full`}
    >
      <body
        className="min-h-screen flex flex-col"
        style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" }}
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
