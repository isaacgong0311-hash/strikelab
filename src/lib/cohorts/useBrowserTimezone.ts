"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const serverZone = () => undefined;

/**
 * The visitor's IANA timezone, or undefined while rendering on the server.
 * useSyncExternalStore gives the server's value during hydration and the
 * browser's right after, with no effect and no mismatch.
 */
export function useBrowserTimezone(): string | undefined {
  return useSyncExternalStore(subscribe, clientZone, serverZone);
}
