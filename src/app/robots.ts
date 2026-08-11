import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Vercel sets VERCEL_ENV to "production" only for the deployment aliased to
// the production domains (strikelab.dev + the git-master alias promoted to
// prod); "preview" and "development" cover every PR/branch deploy. Without
// this check, every *-git-*.vercel.app preview URL — one per pushed branch —
// was fully crawlable and could get indexed as a separate, worse-ranking
// duplicate of the real site.
const isProduction = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Only /api/ is blocked here. The private routes (/dashboard, /success,
      // /sign-in, /sign-up) send `noindex` via metadata instead — blocking them
      // in robots.txt would stop crawlers reading that directive, so they could
      // still get indexed from inbound links with no way to drop them.
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
