"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackMarketing, type MarketingEvent } from "@/lib/analytics";

/** A normal link (works without JS) that also records a funnel event on click. */
export default function TrackedLink({
  event,
  eventProps,
  ...props
}: ComponentProps<typeof Link> & { event: MarketingEvent; eventProps?: Record<string, string> }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackMarketing(event, eventProps);
        props.onClick?.(e);
      }}
    />
  );
}

/** The same for plain anchors: mailto: and external booking links. */
export function TrackedAnchor({
  event,
  eventProps,
  ...props
}: ComponentProps<"a"> & { event: MarketingEvent; eventProps?: Record<string, string> }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackMarketing(event, eventProps);
        props.onClick?.(e);
      }}
    />
  );
}
