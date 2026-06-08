import type { Metadata } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FinPath — AI Financial Coach",
  description:
    "Free, AI-powered financial coaching for everyone. Get a personalized budget analysis, debt payoff strategy, and savings plan in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body
        className="min-h-screen antialiased"
        style={{
          background: "var(--bg)",
          color: "var(--ink)",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        }}
      >
        <div className="fp-bg-grid" />
        {children}
      </body>
    </html>
  );
}
