import type { CSSProperties } from "react";

/** Hazard-stripe barrier — used for "coming soon" path nodes. */
export default function ConstructionIcon({
  size = 22,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M3 18h18" />
      <path d="M5 18v-4l14-2v6" />
      <path d="M7.5 14.5 9 12M11.5 14 13 11.5M15.5 13.5 17 11" />
      <path d="M5 14h14" />
    </svg>
  );
}
