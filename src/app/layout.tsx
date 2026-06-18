import type { Metadata, Viewport } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import V2Animator from "@/components/V2Animator";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { AuthProvider } from "@/lib/auth/AuthProvider";

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
  alternates: {
    canonical: "/",
  },
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
  themeColor: "#16a34a",
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
      className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full`}
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
