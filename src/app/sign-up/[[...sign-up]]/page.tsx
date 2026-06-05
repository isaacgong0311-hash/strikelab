"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { localStorage.setItem("sl_user", JSON.stringify({ name, email })); } catch {}
    setTimeout(() => router.push("/dashboard"), 400);
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo">∫</span></div>
        <h1 className="auth-title">Start learning free</h1>
        <p className="auth-sub">All 10 lessons, the Python playground, and the Greek visualizer — free forever.</p>

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

        <p className="auth-alt">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
