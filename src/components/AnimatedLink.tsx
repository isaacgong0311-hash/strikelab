"use client";

import { Link000, Link001 } from "@/components/ui/skiper-ui/skiper40";
import { cn } from "@/lib/utils";

/**
 * Skiper UI's animated links, wired for StrikeLab.
 *
 * The registry ships six variants (see `@/components/ui/skiper-ui/skiper40`);
 * this picks between the two that suit a link list and hides the difference
 * from call sites:
 *
 *   - internal href → Link000, which renders `next/link` so client-side
 *     navigation still happens, with the rule wiping in from the left.
 *   - external href → Link001, which adds the little diagonal arrow on hover
 *     and opens in a new tab.
 *
 * Variants 002–005 (reverse wipe, centre-out, and the two mix-blend highlight
 * treatments) are exported from the registry file if a page wants them.
 *
 * The underline transition is *not* separately guarded for reduced motion
 * because it doesn't need to be: `src/styles/foundation.css` already zeroes
 * `transition-duration` on `*::before` under `[data-motion="reduce"]`.
 */

/** mailto:/tel:/http(s):/protocol-relative all leave the app. */
function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

export interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedLink({ href, children, className }: AnimatedLinkProps) {
  // `w-fit` matters: the underlying components are `flex`, so inside a column
  // the anchor would stretch to the full track width and drag a `before:w-full`
  // rule out with it — an underline several times wider than its text.
  if (isExternal(href)) {
    return (
      <Link001
        href={href}
        // Link001 places the rule at `top-[1.5em]`, which is tuned for the
        // large display type in Skiper's demo and lands well below the text at
        // list sizes. Pinning it to the bottom of the box keeps it on the
        // baseline. This override only works because Link001 appends
        // `className` last in its `cn()` call, so tailwind-merge lets it win.
        className={cn("w-fit before:top-auto before:bottom-0", className)}
      >
        {children}
      </Link001>
    );
  }

  return (
    <Link000 href={href} className={cn("w-fit", className)}>
      {children}
    </Link000>
  );
}
