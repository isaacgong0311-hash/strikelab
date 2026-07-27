// Canonical site URL — the one domain search engines should index.
//
// Deliberately NOT read from NEXT_PUBLIC_SITE_URL: canonical tags, the sitemap
// and robots.txt must always point at the production domain regardless of which
// deployment renders them (preview builds and *.vercel.app aliases included).
// Pointing them at the rendering origin is what caused every page on
// strikelab.dev to declare strikelabco.vercel.app as its canonical.
//
// For redirect targets that *should* follow the current deployment (Stripe
// success/cancel URLs), use BASE_URL from `@/lib/stripe` instead.
export const SITE_URL = "https://strikelab.dev";

export const SITE_NAME = "StrikeLab";
export const SITE_DESCRIPTION =
  "Learn investing, options pricing, and quant finance by building a real Python pricing engine in your browser. Black-Scholes, the Greeks, CAPM, and backtesting — free for high schoolers.";
