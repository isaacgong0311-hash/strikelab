"use client";

import { useSyncExternalStore } from "react";
import { readNextPath } from "./nextPath";

const noopSubscribe = () => () => {};

/**
 * The sanitized `?next=` path, e.g. /join/CODE from a class invite. Renders
 * the default on the server and first paint, then the real value, so links
 * built from it never cause a hydration mismatch.
 */
export function useNextPath(fallback = "/dashboard"): string {
  return useSyncExternalStore(noopSubscribe, () => readNextPath(fallback), () => fallback);
}
