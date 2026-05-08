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
      className="flex items-center gap-8 px-8 py-3 border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
    >
      {/* Logo: monospace for the sigma symbol, serif for the name */}
      <Link href="/" className="flex items-center gap-1.5 font-bold text-base tracking-tight">
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)", fontSize: "1.1rem" }}>σ</span>
        <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#e2e8f0" }}>
          Strike
        </span>
        <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontStyle: "italic" }}>
          Lab
        </span>
      </Link>

      <div className="flex gap-6 ml-2">
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
    </nav>
  );
}
