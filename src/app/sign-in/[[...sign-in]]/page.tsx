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
    // Redirect to dashboard — full auth wired once Clerk keys are added
    setTimeout(() => router.push("/dashboard"), 400);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="text-4xl mb-2"
            style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)" }}
          >
            σ
          </div>
          <h1
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted2)" }}>
            Sign in to resume your lessons and track progress.
          </p>
        </div>

        <div
          className="rounded-xl border p-8"
          style={{ background: "#0D1F35", borderColor: "#1E3A5F" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm" style={{ color: "#cbd5e1" }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none focus:border-white transition-colors"
                style={{ background: "#091525", border: "1px solid #1E3A5F" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm" style={{ color: "#cbd5e1" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none focus:border-white transition-colors"
                style={{ background: "#091525", border: "1px solid #1E3A5F" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
              style={{
                background: "linear-gradient(135deg, #ffffff, #a3a3a3)",
              }}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="text-xs text-center mt-5" style={{ color: "#64748b" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-blue-400 hover:text-white transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
