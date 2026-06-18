"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowser();

    // Fallback when Supabase isn't configured yet — keep the old local behavior.
    if (!supabase) {
      try { localStorage.setItem("sl_user", JSON.stringify({ email })); } catch {}
      router.push("/dashboard");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
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

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo">∫</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to pick up your streak and keep learning.</p>

        {error && <p className="auth-error" style={{ color: "var(--coral, #ef4444)", fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button type="submit" disabled={loading} className="v2-btn" style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Signing in…" : <>Sign in <span className="v2-arr">→</span></>}
          </button>
        </form>

        {oauthEnabled && (
          <button type="button" onClick={handleGoogle} className="v2-btn ghost" style={{ width: "100%", marginTop: 10 }}>
            Continue with Google
          </button>
        )}

        <p className="auth-alt">
          New here? <Link href="/sign-up">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}
