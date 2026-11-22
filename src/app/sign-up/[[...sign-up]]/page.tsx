"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import AuthCard, { authStyles } from "@/components/AuthCard";
import AuthError from "@/components/AuthError";
import { Button } from "@/components/ui/Action";
import { TextField } from "@/components/ui/Field";
import { useNextPath } from "@/lib/auth/useNextPath";
import { getAttribution } from "@/lib/attribution";
import { PLANNED_SEASON } from "@/lib/seasons/planned";
import styles from "./signup.module.css";
import CheckEmail from "./CheckEmail";

type SignupRole = "student" | "leader";

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
  // Where to land after auth, e.g. /join/CODE from a class invite link.
  const nextPath = useNextPath();
  const [checkEmail, setCheckEmail] = useState(false);
  // StrikeLab is for ages 13 and up (privacy page, "Age"). Asked of everyone,
  // and recorded on the account (build plan T3.6).
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const signupSource = useSignupSource();
  // Leaders coming from /pilot (next=/teach/...), and students from an invite
  // (next=/join/...) or the season page (next=/seasons), get the obvious
  // answer preselected; anyone else picks.
  const [roleChoice, setRoleChoice] = useState<SignupRole | null>(null);
  const role: SignupRole | null =
    roleChoice ?? (nextPath.startsWith("/teach") ? "leader" : nextPath.startsWith("/join") || nextPath.startsWith("/seasons") ? "student" : null);
  // A new leader with nowhere particular to go starts class setup.
  const destination = role === "leader" && nextPath === "/dashboard" ? "/teach/new" : nextPath;
  const leaderFlow = nextPath.startsWith("/teach");
  // Arrived from the season page: say what this account is for.
  const seasonFlow = !leaderFlow && nextPath.startsWith("/seasons");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
        data: {
          display_name: name,
          full_name: name,
          signup_source: signupSource,
          signup_role: role,
          age_13_plus_confirmed_at: new Date().toISOString(),
        },
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
    if (!ageConfirmed) {
      setError("Please confirm you're 13 or older first.");
      return;
    }
    setError(null);
    // Google can't carry signup metadata, so the callback reads these cookies.
    if (role) document.cookie = `sl_role=${role}; path=/; max-age=3600; SameSite=Lax`;
    document.cookie = "sl_age13=1; path=/; max-age=3600; SameSite=Lax";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}` },
    });
    if (error) setError(error.message);
  }

  const oauthEnabled = Boolean(getSupabaseBrowser());

  const signInHref = destination === "/dashboard" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(destination)}`;

  if (checkEmail) {
    return (
      <CheckEmail
        email={email}
        redirectTo={`${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`}
        signInHref={signInHref}
        onStartAgain={() => { setCheckEmail(false); setPassword(""); }}
      />
    );
  }

  const heading = leaderFlow
    ? { title: "Create your leader account", subtitle: "Pilots are free. Setting up your class takes about three minutes." }
    : seasonFlow
      ? { title: `Join ${PLANNED_SEASON.title}`, subtitle: "Free. Next you\u2019ll pick a leaderboard handle. Boards show handles, never real names." }
      : { title: "Start learning free", subtitle: "An account saves your progress across devices and gives you a handle for the season leaderboards." };

  return (
    <AuthCard
      title={heading.title}
      subtitle={heading.subtitle}
      footer={<>Already have an account? <Link href={signInHref}>Sign in</Link></>}
    >
      <AuthError message={error} />

      <form onSubmit={handleSubmit} className={authStyles.form}>
        <fieldset className={styles.roles}>
          <legend className={styles.legend}>I&apos;m signing up as</legend>
          <div className={styles.roleOptions}>
            {([
              ["student", "A student"],
              ["leader", "A club leader or teacher"],
            ] as const).map(([value, label]) => (
              <label key={value} className={styles.role}>
                <input
                  type="radio"
                  name="signup-role"
                  value={value}
                  required
                  checked={role === value}
                  onChange={() => setRoleChoice(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <TextField
          label="Your name"
          type="text"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete={role === "leader" ? "name" : "nickname"}
          help={role === "leader"
            ? "Shown on your class pages."
            : "What your club leader will see. A first name and last initial is enough."}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          help="Use at least 8 characters."
        />
        <label className={styles.attest}>
          <input
            type="checkbox"
            required
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
          />
          <span>I&apos;m 13 or older.</span>
        </label>
        <Button type="submit" disabled={loading} className={authStyles.full}>
          {loading ? "Creating account…" : "Create free account"}
        </Button>
      </form>

      {oauthEnabled && (
        <Button variant="secondary" onClick={handleGoogle} className={authStyles.full}>
          Continue with Google
        </Button>
      )}

      <p className={authStyles.legal}>
        By creating an account, you agree to StrikeLab&rsquo;s{" "}
        <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </AuthCard>
  );
}
