import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, letting later classes win over earlier ones.
 *
 * This exists because shadcn-style registry components (see
 * `@/components/ui/skiper40`) are written against it — it is the alias shadcn
 * writes into `components.json` as `aliases.utils`. StrikeLab's own primitives
 * in `src/components/ui/` use CSS modules and design tokens and do not need it;
 * don't reach for `cn` unless you are composing Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
