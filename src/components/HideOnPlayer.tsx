"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Focused tasks with their own top bar, so the site header and footer stay out
 * of the way: short-lesson sessions, and a timed season challenge or the
 * practice round (/seasons/<id>, one segment below /seasons).
 */
export function isPlayerPath(path: string | null): boolean {
  if (!path) return false;
  return path.startsWith("/learn/") || /^\/seasons\/[^/]+\/?$/.test(path);
}

export default function HideOnPlayer({ children }: { children: ReactNode }) {
  return isPlayerPath(usePathname()) ? null : <>{children}</>;
}
