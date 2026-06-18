// Canonical site URL. Override per-environment with NEXT_PUBLIC_SITE_URL
// (e.g. set it to a custom domain once you have one). Falls back to the
// current Vercel deployment domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://strikelabco.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "StrikeLab";
export const SITE_DESCRIPTION =
  "Learn investing, options pricing, and quant finance by building a real Python pricing engine in your browser. Black-Scholes, the Greeks, CAPM, and backtesting — free for high schoolers.";
