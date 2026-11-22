"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import AuthCard, { authStyles as styles } from "@/components/AuthCard";
import AuthError from "@/components/AuthError";
import { ActionLink, Button } from "@/components/ui/Action";
import { TextField } from "@/components/ui/Field";

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
    return <AuthCard title="Password updated" subtitle="Taking you to your dashboard…" />;
  }

  // The link from the reset email exchanges a code for a session via
  // /auth/callback before landing here — no session means the link was
  // missing, expired, or already used.
  if (!authLoading && !user) {
    return (
      <AuthCard
        title="Link expired"
        subtitle="This password reset link is invalid or has expired. Request a new one."
      >
        <ActionLink href="/forgot-password" className={styles.full}>Request a new link</ActionLink>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <AuthError message={error} />

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          label="New password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          help="Use at least 8 characters."
          autoFocus
          disabled={authLoading}
        />
        <TextField
          label="Confirm password"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          disabled={authLoading}
        />
        <Button type="submit" disabled={loading || authLoading} className={styles.full}>
          {authLoading ? "Verifying link…" : loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
