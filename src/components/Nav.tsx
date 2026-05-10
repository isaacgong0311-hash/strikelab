"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/playground", label: "Playground" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav
      className="flex items-center justify-between px-8 py-3 border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
    >
      {/* Left: logo + links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-base tracking-tight">
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)", fontSize: "1.1rem" }}>σ</span>
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#e2e8f0" }}>
            Strike
          </span>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontStyle: "italic" }}>
            Lab
          </span>
        </Link>

        <div className="flex gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm transition-colors"
              style={{
                color: path === l.href ? "#e2e8f0" : "var(--muted)",
                fontFamily: "var(--font-sans)",
                fontWeight: path === l.href ? 500 : 400,
                borderBottom: path === l.href ? "1px solid var(--accent)" : "1px solid transparent",
                paddingBottom: "2px",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: GitHub */}
      <a
        href="https://github.com/isaacgong0311-hash/strikelab"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-blue-500 hover:text-white"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        GitHub
      </a>
    </nav>
  );
}
