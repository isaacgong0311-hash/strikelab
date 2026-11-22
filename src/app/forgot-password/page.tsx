"use client";
import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import AuthCard, { authStyles as styles } from "@/components/AuthCard";
import AuthError from "@/components/AuthError";
import { Button } from "@/components/ui/Action";
import { TextField } from "@/components/ui/Field";

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

  const backToSignIn = <Link href="/sign-in">Back to sign in</Link>;

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={<>If an account exists for <strong>{email}</strong>, we sent a link to reset your password. It expires in an hour.</>}
        footer={backToSignIn}
      />
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email on your account and we’ll send a reset link."
      footer={backToSignIn}
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
          autoFocus
        />
        <Button type="submit" disabled={loading} className={styles.full}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
