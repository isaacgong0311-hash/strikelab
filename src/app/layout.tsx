import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import V2Animator from "@/components/V2Animator";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { AuthProvider } from "@/lib/auth/AuthProvider";

// Plus Jakarta Sans — headings.
//
// Replaces Syne, which was a geometric *poster/fashion* display face. Two
// problems: it read as editorial rather than educational, and its zero is a
// perfect circle with no slash or dot, so every figure on the dashboard
// rendered as a letter — "O LESSONS DONE", "O%", "O/21". On a product whose
// entire subject is numbers, that isn't a stylistic quibble.
//
// Jakarta keeps some warmth and personality at heavy weights without the
// costume, and its numerals are unambiguous.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Inter — UI and body.
//
// Replaces Space Grotesk. Inter is the workhorse behind most modern learning
// products for a reason: it is boring in the way interface type should be,
// and stays legible at the 11-13px the nav, pills and labels rely on.
const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// JetBrains Mono — best-in-class coding mono for the Python exercises
const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StrikeLab — Learn Options Pricing & Quant Finance",
    template: "%s — StrikeLab",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "options pricing",
    "Black-Scholes",
    "the Greeks",
    "quant finance for high schoolers",
    "learn options trading",
    "options pricing engine",
    "implied volatility",
    "quantitative finance course",
    "Python finance",
    "delta gamma theta vega",
    "binomial tree options",
    "CAPM",
    "free quant finance course",
  ],
  authors: [{ name: "Isaac Gong" }],
  creator: "Isaac Gong",
  verification: {
    google: "dxWqdFnQfkMopeBF2ZXbCzTOfY3A5gxR6oGKyciJ-JM",
  },
  manifest: "/manifest.webmanifest",
  // NOTE: deliberately no `alternates.canonical` here. Root metadata is
  // inherited by every page that doesn't override the field, so a canonical
  // set here would mark all of them as duplicates of the homepage. Pages
  // declare their own via `pageMetadata()` in @/lib/seo.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "StrikeLab — Learn Options Pricing & Quant Finance",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StrikeLab — Learn Options Pricing & Quant Finance",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StrikeLab",
  },
};

export const viewport: Viewport = {
  themeColor: "#147038",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      founder: { "@type": "Person", name: "Isaac Gong" },
      sameAs: ["https://github.com/isaacgong0311-hash/strikelab"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${jetbrains.variable} h-full`}
    >
      <body
        className="min-h-screen flex flex-col"
        style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-ui), system-ui, sans-serif" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        {/* Global v2 background — same on every page */}
        <div id="v2-bg-grid" className="v2-bg-grid" />
        <div className="v2-bg-vignette" />

        <AuthProvider>
          <V2Animator />
          <Nav />
          <main className="flex-1 relative" style={{ zIndex: 1 }}>{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
