"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import AuthCard, { authStyles as styles } from "@/components/AuthCard";
import AuthError from "@/components/AuthError";
import { Button } from "@/components/ui/Action";
import { TextField } from "@/components/ui/Field";
import { useNextPath } from "@/lib/auth/useNextPath";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Where to land after auth, e.g. /join/CODE from a class invite link.
  const nextPath = useNextPath();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowser();

    // Fallback when Supabase isn't configured yet — keep the old local behavior.
    if (!supabase) {
      try { localStorage.setItem("sl_user", JSON.stringify({ email })); } catch {}
      router.push(nextPath);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
    });
    if (error) setError(error.message);
  }

  const oauthEnabled = Boolean(getSupabaseBrowser());

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to pick up your progress and your season handle."
      footer={
        <>New here? <Link href={nextPath === "/dashboard" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(nextPath)}`}>Create a free account</Link></>
      }
    >
      <AuthError message={error} />

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          autoComplete="email"
        />
        <div className={styles.fieldWithLink}>
          <Link href="/forgot-password" className={styles.labelLink}>Forgot password?</Link>
          <TextField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" disabled={loading} className={styles.full}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {oauthEnabled && (
        <Button variant="secondary" onClick={handleGoogle} className={styles.full}>
          Continue with Google
        </Button>
      )}
    </AuthCard>
  );
}
