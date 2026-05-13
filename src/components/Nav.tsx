"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIMARY = [
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/lessons",     label: "Lessons" },
  { href: "/playground",  label: "Playground" },
];

const SECONDARY = [
  { href: "/pricing",  label: "Pricing" },
  { href: "/about",    label: "About" },
  { href: "/roadmap",  label: "Roadmap" },
];

export default function Nav() {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      {/* ─── Announcement bar (monochrome) ──────────────────────────────────── */}
      <div
        className="text-center text-[11px] py-1.5 border-b relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "var(--border)",
          color: "var(--fg-mute)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
          style={{ background: "var(--check)", boxShadow: "0 0 8px rgba(74,222,128,0.45)" }}
        />
        New —{" "}
        <span style={{ color: "var(--fg)", fontWeight: 600 }}>Implied Vol, Strategies &amp; Binomial Trees just shipped</span>{" "}
        ·{" "}
        <Link
          href="/roadmap"
          className="underline underline-offset-2 transition-colors"
          style={{ color: "var(--fg)" }}
        >
          What&rsquo;s next →
        </Link>
      </div>

      {/* ─── Main nav ──────────────────────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-6 border-b sticky top-0 z-50"
        style={{
          borderColor: "var(--border)",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          minHeight: "64px",
        }}
      >
        {/* Left: logo + primary links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 tracking-tight group"
            style={{ fontSize: "1.05rem" }}
          >
            <span
              className="grid place-items-center transition-colors"
              style={{
                width: 24,
                height: 24,
                border: "1.5px solid var(--fg)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--fg)",
              }}
            >
              SL
            </span>
            <span
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg)" }}
            >
              Strike<span style={{ fontStyle: "normal", fontWeight: 600 }}>Lab</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 h-full">
            {[...PRIMARY, ...SECONDARY].map((l, i) => {
              const active = isActive(l.href);
              const isFirstSecondary = i === PRIMARY.length;
              return (
                <span key={l.href} className="flex items-center">
                  {isFirstSecondary && (
                    <div className="h-4 w-px mx-2" style={{ background: "var(--border-hi)" }} />
                  )}
                  <Link
                    href={l.href}
                    className="text-[11px] px-3 py-1.5 rounded-md transition-all uppercase"
                    style={{
                      color: active ? "var(--fg)" : "var(--fg-mute)",
                      fontWeight: active ? 600 : 400,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {l.label}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: utility + CTA */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/isaacgong0311-hash/strikelab"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-all"
            style={{
              border: "1px solid var(--border-hi)",
              color: "var(--fg-mute)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>

          <Link
            href="/sign-in"
            className="hidden sm:inline-block text-[11px] px-2 py-1.5 uppercase transition-colors"
            style={{
              color: "var(--fg-mute)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
            }}
          >
            Sign in
          </Link>

          <Link href="/sign-up" className="v2-btn sm">
            <span className="v2-label">Start free</span>
            <span className="v2-arr">→</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
