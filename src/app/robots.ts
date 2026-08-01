import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
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
