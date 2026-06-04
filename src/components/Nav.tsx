"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/useProgress";

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
  const { xp, streak, hydrated } = useProgress();

  return (
    <>
      {/* ─── Announcement bar ──────────────────────────────────────────────── */}
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
        New —{" "}
        <span style={{ color: "var(--fg)", fontWeight: 600 }}>Fundamentals track + Options curriculum</span>{" "}
        ·{" "}
        <Link
          href="/roadmap"
          className="underline underline-offset-2 transition-colors"
          style={{ color: "var(--fg)" }}
        >
          What&rsquo;s next →
        </Link>
      </div>

      {/* ─── Main nav ───────────────────────────────────────────────────────── */}
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
                    className="text-[11px] px-3 py-1.5 transition-colors uppercase"
                    style={{
                      color: active ? "var(--fg)" : "var(--fg-mute)",
                      fontWeight: active ? 500 : 400,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.06em",
                      borderBottom: active ? "1px solid var(--fg)" : "1px solid transparent",
                      paddingBottom: "6px",
                    }}
                  >
                    {l.label}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: streak + XP + utility + CTA */}
        <div className="flex items-center gap-2">

          {/* Streak indicator — always visible once hydrated */}
          {hydrated && (
            <Link
              href="/dashboard"
              className={`hidden sm:flex sl-nav-streak${streak > 0 ? " active" : ""}`}
              title={streak > 0 ? `${streak}-day streak!` : "No streak yet"}
            >
              <span>{streak > 0 ? "🔥" : "○"}</span>
              <span>{streak}</span>
            </Link>
          )}

          {/* XP indicator */}
          {hydrated && xp > 0 && (
            <Link
              href="/dashboard"
              className="hidden sm:flex sl-nav-xp"
              title={`${xp} XP total`}
            >
              <span style={{ color: "#fbbf24" }}>✦</span>
              <span>{xp} XP</span>
            </Link>
          )}

          {/* GitHub */}
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
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.4[...]
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
