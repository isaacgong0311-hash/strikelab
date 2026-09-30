"use client";

import { useEffect } from "react";
import { trackMarketing, type MarketingEvent } from "@/lib/analytics";

/**
 * Records a page-level funnel event once per mount. `?src=` from the URL is
 * added as `src` so server-rendered (cacheable) pages don't have to read it.
 */
export default function TrackPageView({ event, props }: { event: MarketingEvent; props?: Record<string, string> }) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    const src = new URLSearchParams(window.location.search).get("src")?.slice(0, 64);
    trackMarketing(event, { ...(JSON.parse(key) as Record<string, string>), ...(src ? { src } : {}) });
  }, [event, key]);
  return null;
}
