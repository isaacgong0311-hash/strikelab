"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/useProgress";
import { useAuth } from "@/lib/auth/AuthProvider";
import BrandMark from "@/components/BrandMark";
import AccessibilityMenu from "@/components/accessibility/AccessibilityMenu";
import { ActionLink } from "@/components/ui/Action";
import { PLANNED_SEASON, shortSeasonDate } from "@/lib/seasons/planned";
import styles from "./Nav.module.css";

type NavItem = { href: string; label: string };

const PRIMARY: NavItem[] = [
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/lessons",     label: "Lessons" },
  { href: "/lab",         label: "Market Lab" },
  { href: "/playground",  label: "Playground" },
  { href: "/seasons",     label: "Seasons" },
];

const SECONDARY: NavItem[] = [
  { href: "/pricing",  label: "Pricing" },
  { href: "/about",    label: "About" },
  { href: "/roadmap",  label: "Roadmap" },
];

// Leaders (signup_role, set at sign-up or when they first create a class)
// lead with their classes; the student surfaces stay one menu away.
const TEACHER: NavItem[] = [
  { href: "/teach",     label: "My classes" },
  { href: "/lessons",   label: "Curriculum" },
  { href: "/demo",      label: "Demo" },
  { href: "/dashboard", label: "Dashboard" },
];

// Signed-out visitors: seasons first (proving-ground direction, PLAN.md
// 2026-10-16), then the training surfaces, then one door each for club
// leaders and parents. Pricing and the demo stay in the footer and on /clubs.
const VISITOR: NavItem[] = [
  { href: "/seasons",    label: "Seasons" },
  { href: "/lessons",    label: "Lessons" },
  { href: "/lab",        label: "Market Lab" },
  { href: "/clubs",      label: "For clubs" },
  { href: "/intensive",  label: "For parents" },
];

// The season announcement shows only on these marketing pages, never in a
// lesson, a cohort or a leader's own pages (frontend work plan FW-2).
const ANNOUNCE_PATHS = new Set(["/", "/lessons", "/pricing", "/about", "/faq"]);

const REPO = "https://github.com/isaacgong0311-hash/strikelab";

// ── Small inline SVG icons (no emojis) ───────────────────────
function FlameIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
      <path d="M5.5 12C3.015 12 1 10.015 1 7.5c0-1.85 1.1-3.45 2.7-4.2-.1.6-.05 1.25.2 1.85C4.4 3.75 5.35 2.5 6.5 1.5c0 1 .35 2 1 2.75C8.3 5.2 9 6.3 9 7.5 9 10.015 7.985 12 5.5 12z"
        fill="currentColor" />
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
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {open ? (
        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
  // Rendered on the server for these paths (no layout shift for visitors),
  // then hidden once a signed-in user is known.
  const showAnnounce = ANNOUNCE_PATHS.has(path) && !user;
  // Progress earns its place in the bar; a first-time visitor isn't greeted
  // by a "0" streak and "0 XP" next to the sign-up button.
  const hasProgress = xp > 0 || streak > 0;
  const [menuOpen, setMenuOpen] = useState(false);

  // One account trigger instead of avatar + name + sign-out side by side.
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!accountOpen) return;
    function onDown(e: PointerEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setAccountOpen(false);
      accountTriggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  // Close the menus whenever the route changes (adjust state during render
  // rather than in an effect — see https://react.dev/learn/you-might-not-need-an-effect).
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll, contain focus, and make background content inert while
  // the mobile navigation dialog is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    const background = [...document.querySelectorAll<HTMLElement>("main, body > footer")];
    background.forEach((element) => { element.inert = true; });
    const panel = mobilePanelRef.current;
    // The bar sits lower than 60px when the announcement shows above it at
    // the top of the page, so size the panel to the space actually left.
    if (panel) panel.style.maxHeight = `${window.innerHeight - panel.getBoundingClientRect().top}px`;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    panel?.querySelector<HTMLElement>(focusableSelector)?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
      background.forEach((element) => { element.inert = false; });
      menuButton?.focus();
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    setAccountOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  const initial = (displayName ?? user?.email ?? "").trim().charAt(0).toUpperCase() || null;

  const isLeader = user?.user_metadata?.signup_role === "leader";
  const primary = !user ? VISITOR : isLeader ? TEACHER : PRIMARY;
  const allLinks = user ? [...primary, ...SECONDARY] : VISITOR;

  return (
    <>
      {showAnnounce && (
        <div className={styles.announce} role="region" aria-label="Season announcement">
          <Link href="/seasons?src=announce" className={styles.announceLink}>
            <span className={styles.announceText}>
              {PLANNED_SEASON.title} starts {shortSeasonDate(PLANNED_SEASON.startsOn)}: free, timed, ranked under a handle
            </span>
            <span aria-hidden="true" className={styles.announceArrow}>→</span>
          </Link>
        </div>
      )}

      {/* The header is the sticky element (not the bar inside it), so it stays
          pinned for the whole page rather than only within its own height. */}
      <header className={styles.header}>
        {/* `nav-bar` is kept as a hook for tests/nav.spec.ts. */}
        <nav className={`nav-bar ${styles.bar}`} aria-label="Primary navigation">
          <div className={styles.left}>
            <Link href="/" className={styles.logo} aria-label="StrikeLab home">
              <BrandMark size={26} />
              <span className={styles.wordmark}>
                Strike<span className={styles.wordmarkLab}>Lab</span>
              </span>
            </Link>

            {/* Only the primary links: the secondary set (Pricing, About,
                Roadmap) lives in the footer and the mobile menu, which is what
                lets the full bar fit a 1024px laptop. */}
            <ul className={styles.links}>
              {primary.map((l) => {
                const active = isActive(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`${styles.link}${active ? ` ${styles.linkActive}` : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.right}>
            {hydrated && hasProgress && (
              <span className={styles.stats}>
                <Link
                  href="/dashboard"
                  className={`${styles.stat}${streak > 0 ? ` ${styles.statStreak}` : ""}`}
                  aria-label={`${streak}-day streak`}
                >
                  <FlameIcon />
                  <span className="sl-num">{streak}</span>
                </Link>
                <Link href="/dashboard" className={`${styles.stat} ${styles.statXp}`} aria-label={`${xp} XP total`}>
                  <DiamondIcon />
                  <span className="sl-num">{xp} XP</span>
                </Link>
              </span>
            )}

            <span className={styles.a11y}><AccessibilityMenu /></span>

            <span className={styles.github}>
              <ActionLink href={REPO} target="_blank" variant="ghost" size="sm">
                <GitHubIcon />
                GitHub
                <span className="sl-visually-hidden"> (opens in a new tab)</span>
              </ActionLink>
            </span>

            {user ? (
              <div className={styles.account} ref={accountRef}>
                <button
                  ref={accountTriggerRef}
                  type="button"
                  className={styles.avatar}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-controls="nav-account-menu"
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
                  <div id="nav-account-menu" className={styles.accountMenu}>
                    {displayName && (
                      <p className={styles.accountName} title={user.email ?? undefined}>{displayName}</p>
                    )}
                    <Link href="/dashboard" className={styles.accountItem} onClick={() => setAccountOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/settings" className={styles.accountItem} onClick={() => setAccountOpen(false)}>
                      Settings
                    </Link>
                    <button type="button" onClick={handleSignOut} className={`${styles.accountItem} ${styles.signOut}`}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <span className={styles.signIn}>
                  <ActionLink href="/sign-in" variant="ghost" size="sm">Sign in</ActionLink>
                </span>
                <span className={styles.cta}>
                  <ActionLink href="/seasons/practice?src=nav" size="sm">Try a practice round</ActionLink>
                </span>
              </>
            )}

            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <>
            <div className={styles.backdrop} aria-hidden="true" onMouseDown={() => setMenuOpen(false)} />
            <div
              id="mobile-navigation"
              ref={mobilePanelRef}
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <ul className={styles.panelLinks}>
                {allLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`${styles.panelLink}${isActive(l.href) ? ` ${styles.panelLinkActive}` : ""}`}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {hydrated && hasProgress && (
                <p className={styles.panelStats}>
                  <span className={`${styles.stat}${streak > 0 ? ` ${styles.statStreak}` : ""}`}>
                    <FlameIcon /><span className="sl-num">{streak}</span> day streak
                  </span>
                  <span className={`${styles.stat} ${styles.statXp}`}>
                    <DiamondIcon /><span className="sl-num">{xp} XP</span>
                  </span>
                </p>
              )}

              <div className={styles.panelSecondary}>
                <a href={REPO} target="_blank" rel="noopener noreferrer" className={styles.panelLink}>
                  <GitHubIcon /> GitHub
                  <span className="sl-visually-hidden"> (opens in a new tab)</span>
                </a>
                {user ? (
                  <>
                    {displayName && (
                      <Link href="/dashboard" className={styles.panelLink} title={user.email ?? undefined}>
                        {displayName}
                      </Link>
                    )}
                    <Link href="/settings" className={styles.panelLink}>Settings</Link>
                    <button type="button" onClick={handleSignOut} className={`${styles.panelLink} ${styles.signOut}`}>
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" className={styles.panelLink}>Sign in</Link>
                    <Link href="/pilot?src=nav-mobile" className={styles.panelLink}>
                      Clubs &amp; teachers: start a free pilot
                    </Link>
                  </>
                )}
              </div>

              {!user && (
                <ActionLink href="/seasons/practice?src=nav-mobile" className={styles.panelCta}>
                  Try a practice round
                </ActionLink>
              )}
            </div>
          </>
        )}
      </header>
    </>
  );
}
