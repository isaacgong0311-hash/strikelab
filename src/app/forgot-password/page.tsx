"use client";
import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError("Password reset isn't available in this environment yet — email hello@strikelab.app.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    // Show the same "check your email" state regardless of whether the
    // address exists — confirming/denying an account by email is a known
    // account-enumeration leak.
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="auth-brand"><span className="auth-logo">∫</span></div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-sub">
            If an account exists for <strong>{email}</strong>, we sent a link to
            reset your password. It expires in an hour.
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
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-sub">Enter the email on your account and we&rsquo;ll send a reset link.</p>

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
              autoFocus
            />
          </label>
          <button type="submit" disabled={loading} className="v2-btn" style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Sending…" : <>Send reset link <span className="v2-arr">→</span></>}
          </button>
        </form>

        <p className="auth-alt">
          <Link href="/sign-in">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
