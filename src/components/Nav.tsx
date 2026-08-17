"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/useProgress";
import { useAuth } from "@/lib/auth/AuthProvider";

const PRIMARY: { href: string; label: string; pro?: boolean }[] = [
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/lessons",     label: "Lessons" },
  { href: "/playground",  label: "Playground" },
  { href: "/sandbox",     label: "Sandbox" },
  { href: "/challenges",  label: "Challenges" },
];

const SECONDARY: { href: string; label: string }[] = [
  { href: "/pricing",  label: "Pricing" },
  { href: "/about",    label: "About" },
  { href: "/roadmap",  label: "Roadmap" },
];

// ── Call-option payoff logo mark ─────────────────────────────
function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Rounded square border */}
      <rect x="1" y="1" width="24" height="24" rx="6.5"
        stroke="currentColor" strokeWidth="1.8" />
      {/* Call option payoff: flat line → kink → diagonal up */}
      <polyline
        points="4,19 12,19 22,7"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Strike-price tick mark at kink */}
      <line x1="12" y1="17" x2="12" y2="21"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Small inline SVG icons (no emojis) ───────────────────────
function FlameIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
      <path d="M5.5 12C3.015 12 1 10.015 1 7.5c0-1.85 1.1-3.45 2.7-4.2-.1.6-.05 1.25.2 1.85C4.4 3.75 5.35 2.5 6.5 1.5c0 1 .35 2 1 2.75C8.3 5.2 9 6.3 9 7.5 9 10.015 7.985 12 5.5 12z"
        fill="currentColor" opacity="0.85"/>
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 1L9 5L5 9L1 5L5 1Z" fill="currentColor"/>
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {open ? (
        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <line x1="3" y1="5.5" x2="17" y2="5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="14.5" x2="17" y2="14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const isActive = (href: string) => path === href || path.startsWith(href + "/");
  const { xp, streak, hydrated } = useProgress();
  const { user, displayName, signOut } = useAuth();
  // Gates the gamification pills — see the note at their render site.
  const hasProgress = xp > 0 || streak > 0;
  const [menuOpen, setMenuOpen] = useState(false);

  // Account dropdown — replaces what used to be three separate elements
  // (avatar circle, name link, sign-out button) with one trigger. Signed-in
  // state was crowding the right edge to 7+ elements next to the streak/XP
  // pills; a single account affordance is the pattern Linear/Mercury/Ramp
  // use for exactly this reason.
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!accountOpen) return;
    function onDown(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accountOpen]);

  // Cheap scroll-past-hero shadow — no backdrop-filter (see nav-bar comment,
  // it's dead weight per frame), just a class toggle read once per animation
  // frame via a passive listener.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes (adjust state during
  // render rather than in an effect — see https://react.dev/learn/you-might-not-need-an-effect).
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setMenuOpen(false);
  }

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    setAccountOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  const initial = (displayName ?? user?.email ?? "").trim().charAt(0).toUpperCase() || null;

  const allLinks = [...PRIMARY, ...SECONDARY] as { href: string; label: string; pro?: boolean }[];

  return (
    <>
      {/* ─── Announcement bar ──────────────────────────────────────────────── */}
      <div className="nav-announce">
        New &mdash;{" "}
        <Link href="/sandbox" className="nav-announce-bold" style={{ textDecoration: "none" }}>
          Paper-trading sandbox just shipped
        </Link>{" "}
        &middot;{" "}
        <Link href="/roadmap" className="nav-announce-link">
          What&rsquo;s next →
        </Link>
      </div>

      {/* ─── Main nav ──────────────────────────────────────────────────────── */}
      <nav className={`nav-bar${scrolled ? " is-scrolled" : ""}`}>

        {/* Left: logo + primary links */}
        <div className="nav-left">
          <Link href="/" className="nav-logo" aria-label="StrikeLab home">
            <LogoMark />
            <span className="nav-wordmark">
              Strike<span className="nav-wordmark-lab">Lab</span>
            </span>
          </Link>

          <div className="nav-links">
            {allLinks.map((l, i) => {
              const active = isActive(l.href);
              const isFirstSecondary = i === PRIMARY.length;
              return (
                <span key={l.href} className="nav-link-wrap">
                  {isFirstSecondary && <div className="nav-divider" />}
                  <Link
                    href={l.href}
                    className={`nav-link${active ? " active" : ""}`}
                  >
                    {l.label}
                    {"pro" in l && l.pro && (
                      <span className="nav-pro-badge">PRO</span>
                    )}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: stats + utility + CTA */}
        <div className="nav-right">

          {/* Streak + XP + avatar.
              Only rendered once there's actually progress to show. A first-time
              visitor was being greeted by a "0" streak and "0 XP" next to the
              sign-up button, which advertises an empty account before they have
              any reason to care — and crowded the bar to 12+ elements. Progress
              earns its place in the nav; it doesn't start there. */}
          {hydrated && hasProgress && (
            <>
              <Link
                href="/dashboard"
                className={`nav-stat-pill${streak > 0 ? " streak-active" : ""}`}
                title={streak > 0 ? `${streak}-day streak` : "No streak yet"}
              >
                <FlameIcon />
                <span>{streak}</span>
              </Link>

              <Link
                href="/dashboard"
                className="nav-stat-pill xp"
                title={`${xp} XP total`}
              >
                <DiamondIcon />
                <span>{xp} XP</span>
              </Link>
            </>
          )}

          {/* GitHub */}
          <a
            href="https://github.com/isaacgong0311-hash/strikelab"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-ghost-btn"
          >
            <GitHubIcon />
            <span>GitHub</span>
          </a>

          {user ? (
            <div className="nav-account" ref={accountRef}>
              <button
                type="button"
                className="nav-avatar"
                aria-label="Account menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                {initial ?? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M1.5 13c0-2.76 2.462-5 5.5-5s5.5 2.24 5.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              {accountOpen && (
                <div className="nav-account-menu" role="menu">
                  {displayName && (
                    <div className="nav-account-name" title={user.email ?? undefined}>{displayName}</div>
                  )}
                  <Link href="/dashboard" className="nav-account-item" role="menuitem" onClick={() => setAccountOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/settings" className="nav-account-item" role="menuitem" onClick={() => setAccountOpen(false)}>
                    Settings
                  </Link>
                  <button type="button" onClick={handleSignOut} className="nav-account-item nav-account-item-signout" role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="nav-signin">Sign in</Link>
              <Link href="/sign-up" className="nav-cta">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </>
          )}

          {/* Mobile menu toggle — only visible below the nav-links breakpoint */}
          <button
            type="button"
            className="nav-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* ─── Mobile menu panel ─────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMenuOpen(false)}>
          <div className="nav-mobile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="nav-mobile-links">
              {allLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-mobile-link${isActive(l.href) ? " active" : ""}`}
                >
                  {l.label}
                  {"pro" in l && l.pro && <span className="nav-pro-badge">PRO</span>}
                </Link>
              ))}
            </div>
            <div className="nav-mobile-divider" />
            {hydrated && hasProgress && (
              <div className="nav-mobile-stats">
                <span className={`nav-stat-pill${streak > 0 ? " streak-active" : ""}`} style={{ display: "flex" }}>
                  <FlameIcon /><span>{streak} day streak</span>
                </span>
                <span className="nav-stat-pill xp" style={{ display: "flex" }}>
                  <DiamondIcon /><span>{xp} XP</span>
                </span>
              </div>
            )}
            <a
              href="https://github.com/isaacgong0311-hash/strikelab"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-mobile-link"
            >
              <GitHubIcon /> <span style={{ marginLeft: 6 }}>GitHub</span>
            </a>
            {user ? (
              <>
                {displayName && (
                  <Link href="/dashboard" className="nav-mobile-link" title={user.email ?? undefined}>
                    {displayName}
                  </Link>
                )}
                <button type="button" onClick={handleSignOut} className="nav-mobile-link nav-mobile-signout">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="nav-mobile-link">Sign in</Link>
                <Link href="/sign-up" className="nav-cta" style={{ marginTop: 8, justifyContent: "center" }}>
                  Start free <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
