import type { HTMLAttributes } from "react";

export function LiveRegion({ assertive = false, atomic = true, className, ...props }: HTMLAttributes<HTMLDivElement> & { assertive?: boolean; atomic?: boolean }) {
  return <div role={assertive ? "alert" : "status"} aria-live={assertive ? "assertive" : "polite"} aria-atomic={atomic} className={className} {...props} />;
}

export function StatusMessage({ tone = "neutral", ...props }: HTMLAttributes<HTMLDivElement> & { tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <LiveRegion className="sl-status" data-tone={tone} {...props} />;
}
