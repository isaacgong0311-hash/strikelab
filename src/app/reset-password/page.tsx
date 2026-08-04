"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError("Password reset isn't available in this environment yet.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  if (done) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="auth-brand"><span className="auth-logo">∫</span></div>
          <h1 className="auth-title">Password updated</h1>
          <p className="auth-sub">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  // The link from the reset email exchanges a code for a session via
  // /auth/callback before landing here — no session means the link was
  // missing, expired, or already used.
  if (!authLoading && !user) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="auth-brand"><span className="auth-logo">∫</span></div>
          <h1 className="auth-title">Link expired</h1>
          <p className="auth-sub">
            This password reset link is invalid or has expired. Request a new one.
          </p>
          <Link href="/forgot-password" className="v2-btn" style={{ width: "100%", marginTop: 10, display: "flex", justifyContent: "center" }}>
            Request new link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo">∫</span></div>
        <h1 className="auth-title">Set a new password</h1>
        <p className="auth-sub">Choose a new password for your account.</p>

        {error && <p className="auth-error" style={{ color: "var(--coral, #ef4444)", fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            New password
            <input
              className="auth-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoFocus
              disabled={authLoading}
            />
          </label>
          <label className="auth-label">
            Confirm password
            <input
              className="auth-input"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              disabled={authLoading}
            />
          </label>
          <button type="submit" disabled={loading || authLoading} className="v2-btn" style={{ width: "100%", marginTop: 4 }}>
            {authLoading ? "Verifying link…" : loading ? "Updating…" : <>Update password <span className="v2-arr">→</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}
