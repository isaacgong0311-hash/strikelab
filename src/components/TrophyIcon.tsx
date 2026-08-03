import type { CSSProperties } from "react";

export default function TrophyIcon({
  size = 28,
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
      <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a2 2 0 0 0 0 4h3M16 5h3a2 2 0 0 1 0 4h-3" />
      <path d="M10 15v2M14 15v2" />
      <path d="M8 21h8" />
      <path d="M9 21c0-2 1-3 3-3s3 1 3 3" />
    </svg>
  );
}
