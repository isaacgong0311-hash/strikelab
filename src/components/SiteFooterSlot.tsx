"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isFocusRoute } from "@/lib/focusRoutes";

/** Renders the (server-rendered) footer everywhere except focus routes. */
export default function SiteFooterSlot({ children }: { children: ReactNode }) {
  return isFocusRoute(usePathname()) ? null : <>{children}</>;
}
