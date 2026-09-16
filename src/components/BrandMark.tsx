export default function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="26" height="26" rx="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20H12.5L23 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 17.5V22.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="22.8" cy="7.1" r="1.8" fill="currentColor" />
    </svg>
  );
}
