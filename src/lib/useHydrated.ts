"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during server rendering/hydration, then true in the live browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
