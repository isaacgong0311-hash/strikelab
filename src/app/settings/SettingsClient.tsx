"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

function SignInPrompt() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1
        className="text-2xl font-semibold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Sign in to manage settings
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted2)" }}>
        Settings are tied to your account.
      </p>
      <Link href="/sign-up" className="v2-btn">Start free →</Link>
      <div style={{ marginTop: 10 }}>
        <Link href="/sign-in" style={{ fontSize: 13, color: "var(--ink-3)" }}>
          I already have an account
        </Link>
      </div>
    </div>
  );
}

type DiscordState = "loading" | "disconnected" | "connected" | "saving" | "testing";

function DiscordSettings() {
  const [state, setState] = useState<DiscordState>("loading");
  const [webhookInput, setWebhookInput] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/discord");
      const data = await res.json();
      setState(data.connected ? "connected" : "disconnected");
    } catch {
      setState("disconnected");
    }
  }, []);

  useEffect(() => {
    // Deferred to dodge the set-state-in-effect lint rule (same pattern as
    // AuthProvider.tsx) — refresh() sets state once its fetch resolves.
    const id = window.setTimeout(() => { refresh(); }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setState("saving");
    try {
      const res = await fetch("/api/settings/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: webhookInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setWebhookInput("");
      setMessage({ text: "Connected. Lesson completions will post here from now on.", isError: false });
      setState("connected");
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Failed to save", isError: true });
      setState("disconnected");
    }
  }

  async function sendTest() {
    setMessage(null);
    setState("testing");
    try {
      const res = await fetch("/api/settings/discord/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send test message");
      setMessage({ text: "Test message sent — check your Discord channel.", isError: false });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Failed to send test message", isError: true });
    } finally {
      setState("connected");
    }
  }

  async function disconnect() {
    setMessage(null);
    await fetch("/api/settings/discord", { method: "DELETE" });
    setState("disconnected");
    setMessage({ text: "Disconnected.", isError: false });
  }

  return (
    <div className="db-panel">
      <div className="db-panel-head">
        <span className="db-panel-title">Discord</span>
      </div>
      <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted2)" }}>
        Auto-post lesson completions and achievements to a Discord channel — handy
        for a school club or study group tracking progress together. Create a
        webhook in your server: <strong>Edit Channel → Integrations → Webhooks →
        New Webhook → Copy Webhook URL</strong>.
      </p>

      {state === "loading" ? (
        <p className="text-xs" style={{ color: "var(--ink-3)" }}>Loading…</p>
      ) : state === "connected" || state === "testing" ? (
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="text-xs px-2 py-1 rounded"
            style={{ background: "var(--grass-tint)", color: "var(--grass)", fontFamily: "var(--font-mono)" }}
          >
            ✓ Connected
          </span>
          <button type="button" onClick={sendTest} disabled={state === "testing"} className="v2-btn ghost sm">
            {state === "testing" ? "Sending…" : "Send test message"}
          </button>
          <button type="button" onClick={disconnect} className="v2-btn ghost sm">
            Disconnect
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="flex gap-2 flex-wrap">
          <input
            className="auth-input"
            style={{ flex: "1 1 320px" }}
            type="url"
            required
            placeholder="https://discord.com/api/webhooks/..."
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
          />
          <button type="submit" disabled={state === "saving"} className="v2-btn sm">
            {state === "saving" ? "Saving…" : "Connect"}
          </button>
        </form>
      )}

      {message && (
        <p className="text-xs mt-3" style={{ color: message.isError ? "var(--coral)" : "var(--grass)" }}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export default function SettingsClient() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <SignInPrompt />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Settings
        </h1>
        <p className="text-sm" style={{ color: "var(--muted2)" }}>
          Integrations and account preferences.
        </p>
      </div>
      <DiscordSettings />
    </div>
  );
}
