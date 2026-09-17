"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import AccessibilityControls from "@/components/accessibility/AccessibilityControls";

function SignInPrompt() {
  return (
    <div className="settings-gate">
      <section className="settings-gate-card" aria-labelledby="settings-gate-title">
        <h1 id="settings-gate-title">Settings</h1>
        <p>
          Sign in to manage your profile, classes, and integrations. Display
          preferences below work without an account and are saved in this browser.
        </p>
        <div className="settings-gate-actions">
          <Link href="/sign-in" className="settings-gate-primary">Sign in</Link>
          <Link href="/sign-up" className="settings-gate-secondary">Create a free account</Link>
        </div>
      </section>
      <AccessibilityControls />
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
    <section className="db-panel" aria-labelledby="discord-settings-title">
      <div className="db-panel-head">
        <h2 id="discord-settings-title" className="db-panel-title">Discord</h2>
      </div>
      <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted2)" }}>
        Auto-post lesson completions and achievements to a Discord channel — handy
        for a school club or study group tracking progress together. Create a
        webhook in your server: <strong>Edit Channel → Integrations → Webhooks →
        New Webhook → Copy Webhook URL</strong>.
      </p>

      {state === "loading" ? (
        <p className="text-xs" style={{ color: "var(--ink-3)" }} role="status">Loading Discord settings…</p>
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
          <label htmlFor="discord-webhook" className="text-xs font-semibold" style={{ color: "var(--ink-2)", flexBasis: "100%" }}>
            Discord webhook URL
          </label>
          <input
            id="discord-webhook"
            className="auth-input"
            style={{ flex: "1 1 320px" }}
            type="url"
            required
            placeholder="https://discord.com/api/webhooks/..."
            autoComplete="url"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
          />
          <button type="submit" disabled={state === "saving"} className="v2-btn sm">
            {state === "saving" ? "Saving…" : "Connect"}
          </button>
        </form>
      )}

      {message && (
        <p className="text-xs mt-3 sl-status" data-tone={message.isError ? "danger" : "success"} role={message.isError ? "alert" : "status"}>
          {message.text}
        </p>
      )}
    </section>
  );
}

interface OwnedClass {
  id: string;
  name: string;
  joinCode: string;
  memberCount: number;
  templateId: string | null;
  startsOn: string | null;
  timezone: string | null;
  launchedAt: string | null;
}

interface JoinedClass {
  id: string;
  name: string;
}

function ClassroomSettings() {
  const [owned, setOwned] = useState<OwnedClass[]>([]);
  const [joined, setJoined] = useState<JoinedClass[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [ownedRes, joinedRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/classes/joined"),
      ]);
      const ownedData = await ownedRes.json();
      const joinedData = await joinedRes.json();
      setOwned(ownedData.classes ?? []);
      setJoined(joinedData.classes ?? []);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => { refresh(); }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreating(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create class");
      setNewClassName("");
      await refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Failed to create class", isError: true });
    } finally {
      setCreating(false);
    }
  }

  async function joinClass(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setJoining(true);
    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCodeInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to join class");
      setJoinCodeInput("");
      setMessage({ text: `Joined ${data.name}.`, isError: false });
      await refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Failed to join class", isError: true });
    } finally {
      setJoining(false);
    }
  }

  return (
    <section className="db-panel" style={{ marginTop: 20 }} aria-labelledby="classroom-settings-title">
      <div className="db-panel-head">
        <h2 id="classroom-settings-title" className="db-panel-title">Classroom</h2>
      </div>
      <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted2)" }}>
        Teaching a class? Create one and share the join code with your students to see
        their progress in one place. Taking a class? Enter the code your teacher gave you.
      </p>

      {!loaded ? (
        <p className="text-xs" style={{ color: "var(--ink-3)" }} role="status">Loading classroom settings…</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            {owned.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {owned.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 flex-wrap text-xs">
                    <Link href={`/dashboard/class/${c.id}`} style={{ color: "var(--ink)", fontWeight: 600 }}>
                      {c.name}
                    </Link>
                    <span style={{ color: "var(--muted2)" }}>{c.memberCount} student{c.memberCount === 1 ? "" : "s"}</span>
                    <span
                      className="px-2 py-1 rounded"
                      style={{ background: "var(--bg2)", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}
                    >
                      Code: {c.joinCode}
                    </span>
                    <Link href={`/dashboard/class/${c.id}`} className="v2-btn ghost sm">
                      View roster →
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={createClass} className="flex gap-2 flex-wrap">
              <label htmlFor="new-class-name" className="text-xs font-semibold" style={{ color: "var(--ink-2)", flexBasis: "100%" }}>
                New class name
              </label>
              <input
                id="new-class-name"
                className="auth-input"
                style={{ flex: "1 1 220px" }}
                type="text"
                required
                placeholder="Class name, e.g. 3rd Period AP Stats"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
              <button type="submit" disabled={creating} className="v2-btn sm">
                {creating ? "Creating…" : "Create class"}
              </button>
            </form>
          </div>

          <div>
            {joined.length > 0 ? (
              <p className="text-xs mb-2" style={{ color: "var(--muted2)" }}>
                You&rsquo;re in: {joined.map((c) => c.name).join(", ")}
              </p>
            ) : (
              <form onSubmit={joinClass} className="flex gap-2 flex-wrap">
                <label htmlFor="join-class-code" className="text-xs font-semibold" style={{ color: "var(--ink-2)", flexBasis: "100%" }}>
                  Class join code
                </label>
                <input
                  id="join-class-code"
                  className="auth-input"
                  style={{ flex: "1 1 160px", textTransform: "uppercase" }}
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Join code"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                />
                <button type="submit" disabled={joining} className="v2-btn ghost sm">
                  {joining ? "Joining…" : "Join a class"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {message && (
        <p className="text-xs mt-3 sl-status" data-tone={message.isError ? "danger" : "success"} role={message.isError ? "alert" : "status"}>
          {message.text}
        </p>
      )}
    </section>
  );
}

export default function SettingsClient() {
  const { user, loading } = useAuth();

  if (loading) return <p className="sl-page-shell" role="status">Loading settings…</p>;
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
      <section id="accessibility" className="db-panel" aria-labelledby="accessibility-settings-title">
        <h2 id="accessibility-settings-title" className="db-panel-title" style={{ marginBottom: 12 }}>Display and accessibility</h2>
        <AccessibilityControls />
      </section>
      <DiscordSettings />
      <ClassroomSettings />
    </div>
  );
}
