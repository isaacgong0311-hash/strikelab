"use client";

import { useState } from "react";
import { trackMarketing, type MarketingEvent } from "@/lib/analytics";

/** Copies text; the text itself is always on screen too, so a blocked clipboard costs nothing. */
export default function CopyButton({
  text,
  label,
  className,
  event,
  eventProps,
}: {
  text: string;
  label: string;
  className?: string;
  /** Funnel event recorded after a successful copy. */
  event?: MarketingEvent;
  eventProps?: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            if (event) trackMarketing(event, eventProps);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard blocked (e.g. a school-managed browser).
          }
        }}
      >
        {copied ? "Copied" : label}
      </button>
      <span className="sl-visually-hidden" role="status">{copied ? "Copied" : ""}</span>
    </>
  );
}
