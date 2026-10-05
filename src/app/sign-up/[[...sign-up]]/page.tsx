"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { TRACKS } from "@/lib/tracks";
import BrandMark from "@/components/BrandMark";
import AuthError from "@/components/AuthError";
import { validateSignUp, type FieldErrors } from "@/lib/auth/validateCredentials";
import { useNextPath } from "@/lib/auth/useNextPath";
import { getAttribution } from "@/lib/attribution";
import styles from "./signup.module.css";
import CheckEmail from "./CheckEmail";

type SignupRole = "student" | "leader";

const TOTAL_LESSONS = TRACKS.reduce((s, t) => s + t.lessons.length, 0);

// Where did this signup come from? (?src=reddit, ?src=aops, ?src=discord, ...)
// Read once on mount, threaded through the email/password path directly and
// stashed in a short-lived cookie so the OAuth round-trip can recover it too
// (Google auth doesn't carry arbitrary signup metadata the way email/password does).
function useSignupSource() {
  const [source] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    // First touch wins: an outreach link's ?src= beats a later CTA's tag.
    return getAttribution().src ?? new URLSearchParams(window.location.search).get("src");
  });
  useEffect(() => {
    if (!source) return;
    document.cookie = `sl_src=${encodeURIComponent(source)}; path=/; max-age=3600; SameSite=Lax`;
  }, [source]);
  return source;
}

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<"role" | "name" | "email" | "password">>({});
  // Where to land after auth, e.g. /join/CODE from a class invite link.
  const nextPath = useNextPath();
  const [checkEmail, setCheckEmail] = useState(false);
  const signupSource = useSignupSource();
  // Leaders coming from /pilot (next=/teach/...) and students from an invite
  // (next=/join/...) get the obvious answer preselected; anyone else picks.
  const [roleChoice, setRoleChoice] = useState<SignupRole | null>(null);
  const role: SignupRole | null =
    roleChoice ?? (nextPath.startsWith("/teach") ? "leader" : nextPath.startsWith("/join") ? "student" : null);
  // A new leader with nowhere particular to go starts class setup.
  const destination = role === "leader" && nextPath === "/dashboard" ? "/teach/new" : nextPath;
  const leaderFlow = nextPath.startsWith("/teach");

  // Clears one field's message as soon as the student starts fixing it.
  const fixed = (field: keyof typeof fieldErrors) => setFieldErrors((current) => ({ ...current, [field]: undefined }));
  const describedBy = (field: keyof typeof fieldErrors, ...extra: string[]) =>
    [...extra, fieldErrors[field] ? `signup-${field}-error` : ""].filter(Boolean).join(" ") || undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // The browser's own validation bubble is off (noValidate): it is unstyled,
    // covers the field it points at and shows one problem at a time.
    const problems = validateSignUp({ role, name, email, password });
    setFieldErrors(problems);
    const first = (["role", "name", "email", "password"] as const).find((field) => problems[field]);
    if (first) {
      document.getElementById(first === "role" ? "signup-role-student" : `signup-${first}`)?.focus();
      return;
    }
    setLoading(true);

    const supabase = getSupabaseBrowser();

    // Fallback when Supabase isn't configured yet — keep the old local behavior.
    if (!supabase) {
      try { localStorage.setItem("sl_user", JSON.stringify({ name, email })); } catch {}
      router.push(destination);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, full_name: name, signup_source: signupSource, signup_role: role },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is on, there's no session yet.
    if (data.session) {
      router.push(destination);
      router.refresh();
    } else {
      setCheckEmail(true);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError(null);
    // Google can't carry signup metadata, so the callback reads this cookie.
    if (role) document.cookie = `sl_role=${role}; path=/; max-age=3600; SameSite=Lax`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}` },
    });
    if (error) setError(error.message);
  }

  const oauthEnabled = Boolean(getSupabaseBrowser());

  if (checkEmail) {
    return (
      <CheckEmail
        email={email}
        redirectTo={`${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`}
        signInHref={destination === "/dashboard" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(destination)}`}
      />
    );
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo"><BrandMark size={34} /></span></div>
        {leaderFlow ? (
          <>
            <h1 className="auth-title">Create your leader account</h1>
            <p className="auth-sub">Pilots are free. Setting up your class takes about three minutes.</p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Start learning free</h1>
            <p className="auth-sub">All {TOTAL_LESSONS} lessons, the Python playground, and the Greek visualizer — free forever.</p>
          </>
        )}

        <AuthError message={error} />

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <fieldset className={styles.roles}>
            <legend className="auth-label">I&apos;m signing up as</legend>
            <div className={styles.roleOptions}>
              {([
                ["student", "A student"],
                ["leader", "A club leader or teacher"],
              ] as const).map(([value, label]) => (
                <label key={value} className={styles.role}>
                  <input
                    id={`signup-role-${value}`}
                    type="radio"
                    name="signup-role"
                    value={value}
                    required
                    aria-describedby={describedBy("role")}
                    checked={role === value}
                    onChange={() => { setRoleChoice(value); fixed("role"); }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.role ? <span id="signup-role-error" className="auth-field-error" role="alert">{fieldErrors.role}</span> : null}
          </fieldset>
          <label className="auth-label">
            Your name
            <input
              className="auth-input"
              id="signup-name"
              type="text"
              required
              maxLength={60}
              value={name}
              aria-invalid={fieldErrors.name ? true : undefined}
              onChange={(e) => { setName(e.target.value); fixed("name"); }}
              placeholder={role === "leader" ? "Jordan Rivera" : "Alex P."}
              autoComplete={role === "leader" ? "name" : "nickname"}
              aria-describedby={describedBy("name", "signup-name-help")}
            />
            <span id="signup-name-help" className="auth-help">
              {role === "leader"
                ? "Shown on your class pages."
                : "What your club leader will see. A first name and last initial is enough."}
            </span>
            {fieldErrors.name ? <span id="signup-name-error" className="auth-field-error" role="alert">{fieldErrors.name}</span> : null}
          </label>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              id="signup-email"
              type="email"
              required
              value={email}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={describedBy("email")}
              onChange={(e) => { setEmail(e.target.value); fixed("email"); }}
              placeholder="you@school.edu"
              autoComplete="email"
            />
            {fieldErrors.email ? <span id="signup-email-error" className="auth-field-error" role="alert">{fieldErrors.email}</span> : null}
          </label>
          <label className="auth-label">
            Password
            <input
              className="auth-input"
              id="signup-password"
              type="password"
              required
              minLength={8}
              value={password}
              aria-invalid={fieldErrors.password ? true : undefined}
              onChange={(e) => { setPassword(e.target.value); fixed("password"); }}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              aria-describedby={describedBy("password", "signup-password-help")}
            />
            <span id="signup-password-help" className="auth-help">Use at least 8 characters.</span>
            {fieldErrors.password ? <span id="signup-password-error" className="auth-field-error" role="alert">{fieldErrors.password}</span> : null}
          </label>
          <button type="submit" disabled={loading} className="v2-btn" style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Creating account…" : <>Create free account <span className="v2-arr">→</span></>}
          </button>
        </form>

        {oauthEnabled && (
          <button type="button" onClick={handleGoogle} className="v2-btn ghost" style={{ width: "100%", marginTop: 10 }}>
            Continue with Google
          </button>
        )}

        <p className="auth-legal" style={{ fontSize: 11, color: "var(--ink-3, #78716c)", marginTop: 14, lineHeight: 1.5 }}>
          By creating an account, you agree to StrikeLab&rsquo;s{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <p className="auth-alt">
          Already have an account? <Link href={destination === "/dashboard" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(destination)}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
