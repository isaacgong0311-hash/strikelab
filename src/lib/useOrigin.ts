"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * The page origin (e.g. https://strikelab.dev) for building shareable
 * absolute links. Empty on the server and first paint, so markup that uses
 * it never mismatches during hydration; prefix relative paths with it.
 */
export function useOrigin(): string {
  return useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
}
