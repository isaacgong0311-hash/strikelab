"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Short-lesson sessions are a focused task with their own top bar and ✕, so the site header and footer stay out of the way. */
export function isPlayerPath(path: string | null): boolean {
  return Boolean(path && path.startsWith("/learn/"));
}

export default function HideOnPlayer({ children }: { children: ReactNode }) {
  return isPlayerPath(usePathname()) ? null : <>{children}</>;
}
