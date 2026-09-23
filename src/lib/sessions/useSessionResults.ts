"use client";

import { useMemo, useSyncExternalStore } from "react";
import { readSessionResults, RESULTS_KEY, type SessionResults } from "./index";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// The raw string is a stable snapshot; parsing happens once per change.
function rawSnapshot(): string {
  try {
    return localStorage.getItem(RESULTS_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * Session results from localStorage. Empty on the server and first paint,
 * so markup that depends on them only enhances after hydration.
 */
export function useSessionResults(): SessionResults {
  const raw = useSyncExternalStore(subscribe, rawSnapshot, () => "");
  // `raw` is the cache key; readSessionResults validates the JSON.
  return useMemo(() => (raw ? readSessionResults() : {}), [raw]);
}
