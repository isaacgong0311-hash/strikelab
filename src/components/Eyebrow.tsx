/**
 * Small uppercase mono kicker label used above page/section headings
 * ("About", "Pricing", "Newsletter", ...). Previously duplicated inline
 * across ~9 call sites with two different (and both too-low-contrast)
 * colors — #888888 in some files, var(--ink-3) in others, both further
 * dimmed with opacity-40/50. Uses --ink-3 at full opacity, which alone
 * clears WCAG AA contrast (see globals.css).
 */
export default function Eyebrow({
  children,
  className = "mb-2",
}: {
  children: React.ReactNode;
  /** Margin/spacing override — default is "mb-2", the most common call-site value. */
  className?: string;
}) {
  return (
    <div
      className={`text-[10px] tracking-widest uppercase ${className}`}
      style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}
    >
      {children}
    </div>
  );
}
