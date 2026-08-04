"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { TRACKS } from "@/lib/tracks";

const TOTAL_LESSONS = TRACKS.reduce((s, t) => s + t.lessons.length, 0);

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowser();

    // Fallback when Supabase isn't configured yet — keep the old local behavior.
    if (!supabase) {
      try { localStorage.setItem("sl_user", JSON.stringify({ name, email })); } catch {}
      router.push("/dashboard");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is on, there's no session yet.
    if (data.session) {
      router.push("/dashboard");
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) setError(error.message);
  }

  const oauthEnabled = Boolean(getSupabaseBrowser());

  if (checkEmail) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="auth-brand"><span className="auth-logo">∫</span></div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-sub">
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account, then sign in.
          </p>
          <p className="auth-alt">
            <Link href="/sign-in">Back to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo">∫</span></div>
        <h1 className="auth-title">Start learning free</h1>
        <p className="auth-sub">All {TOTAL_LESSONS} lessons, the Python playground, and the Greek visualizer — free forever.</p>

        {error && <p className="auth-error" style={{ color: "var(--coral, #ef4444)", fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Full name
            <input
              className="auth-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Isaac Gong"
            />
          </label>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
            />
          </label>
          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
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
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
