"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { localStorage.setItem("sl_user", JSON.stringify({ email })); } catch {}
    setTimeout(() => router.push("/dashboard"), 400);
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo">∫</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to pick up your streak and keep learning.</p>

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

        <p className="auth-alt">
          New here? <Link href="/sign-up">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}
