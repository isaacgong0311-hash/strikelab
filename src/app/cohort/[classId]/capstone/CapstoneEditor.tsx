"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { fetchSubmission, readLocalCode } from "@/lib/submissions/sync";
import { getLessonById } from "@/lib/tracks";
import { CAPSTONE_LIMITS, type CapstoneFields, type CapstonePrompt } from "@/lib/capstone/prompts";
import type { Capstone } from "@/lib/capstone/rows";
import styles from "./capstone.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";
const AUTOSAVE_MS = 3000;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function Field({
  label,
  hint,
  value,
  onChange,
  max,
  rows = 4,
  code = false,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  rows?: number;
  code?: boolean;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <p id={`${id}-hint`} className={styles.hint}>{hint}</p>
      <textarea
        id={id}
        aria-describedby={`${id}-hint`}
        className={code ? `${styles.input} ${styles.code}` : styles.input}
        rows={rows}
        maxLength={max}
        spellCheck={!code}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className={styles.count}>{value.length.toLocaleString()} / {max.toLocaleString()}</span>
    </div>
  );
}

export default function CapstoneEditor({
  classId,
  prompts,
  initial,
  openedByTeacher,
}: {
  classId: string;
  prompts: readonly CapstonePrompt[];
  initial: Capstone | null;
  openedByTeacher: string[];
}) {
  const { user } = useAuth();
  const [fields, setFields] = useState<CapstoneFields>(() => ({
    promptId: initial?.promptId ?? "option-pricing",
    title: initial?.title ?? "",
    thesis: initial?.thesis ?? "",
    code: initial?.code ?? "",
    resultSummary: initial?.resultSummary ?? "",
    reflection: initial?.reflection ?? "",
  }));
  const [capstone, setCapstone] = useState<Capstone | null>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const fieldsRef = useRef(fields);

  const prompt = prompts.find((p) => p.id === fields.promptId) ?? prompts[0];
  const submitted = capstone?.status === "submitted";

  const save = useCallback(async (submit: boolean): Promise<boolean> => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setSaveState("saving");
    setError(null);
    try {
      const res = await fetch(`/api/capstone/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fieldsRef.current, submit }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't save");
      setCapstone(data.capstone);
      setSaveState("saved");
      return true;
    } catch (e) {
      setSaveState("error");
      setError(e instanceof Error ? e.message : "Couldn't save");
      return false;
    }
  }, [classId]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function update<K extends keyof CapstoneFields>(key: K, value: CapstoneFields[K]) {
    const next = { ...fieldsRef.current, [key]: value };
    fieldsRef.current = next;
    setFields(next);
    setSaveState("idle");
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void save(false), AUTOSAVE_MS);
  }

  async function insertLessonCode() {
    if (!prompt.lessonId) return;
    let code = readLocalCode(prompt.lessonId)?.code ?? null;
    const supabase = getSupabaseBrowser();
    if (supabase && user) {
      const remote = await fetchSubmission(supabase, user.id, prompt.lessonId);
      if (remote && (!code || (remote.updatedAt ?? "") > (readLocalCode(prompt.lessonId)?.updatedAt ?? ""))) code = remote.code;
    }
    update("code", code ?? getLessonById(prompt.lessonId)?.exercise.starterCode ?? "");
  }

  async function setShare(enabled: boolean) {
    setSharing(true);
    setError(null);
    try {
      const res = await fetch(`/api/capstone/${classId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't change sharing");
      setCapstone((c) => (c ? { ...c, shareToken: data.shareToken ?? null } : c));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't change sharing");
    } finally {
      setSharing(false);
    }
  }

  const shareUrl = capstone?.shareToken && typeof window !== "undefined" ? `${window.location.origin}/capstone/${capstone.shareToken}` : null;
  const lessonTitle = prompt.lessonId ? getLessonById(prompt.lessonId)?.title : null;

  return (
    <div className={styles.editor}>
      {submitted && capstone?.submittedAt && (
        <p className={styles.success} role="status">
          Submitted {formatDate(capstone.submittedAt)}. You can keep improving it; your teacher sees the latest version.
        </p>
      )}

      <fieldset className={styles.prompts}>
        <legend className={styles.label}>Choose a prompt</legend>
        {prompts.map((p) => (
          <label key={p.id} className={styles.prompt} data-selected={p.id === fields.promptId || undefined}>
            <input
              type="radio"
              name="capstone-prompt"
              value={p.id}
              checked={p.id === fields.promptId}
              onChange={() => update("promptId", p.id)}
            />
            <span>
              <strong>{p.title}</strong>
              <span className={styles.hint}>{p.brief}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className={styles.checklist}>
        <p className={styles.label}>A strong answer includes</p>
        <ul>
          {prompt.checklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className={styles.field}>
        <label htmlFor="capstone-title" className={styles.label}>Title</label>
        <input
          id="capstone-title"
          className={styles.input}
          maxLength={CAPSTONE_LIMITS.title}
          value={fields.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Is Apple's implied volatility too high?"
        />
      </div>

      <Field
        label="Your question"
        hint="What are you trying to find out, and why does it matter?"
        value={fields.thesis}
        onChange={(v) => update("thesis", v)}
        max={CAPSTONE_LIMITS.thesis}
        rows={3}
      />

      <div>
        <Field
          label="Code"
          hint="Paste the Python that produces your result."
          value={fields.code}
          onChange={(v) => update("code", v)}
          max={CAPSTONE_LIMITS.code}
          rows={12}
          code
        />
        {prompt.lessonId && !fields.code.trim() && (
          <button type="button" className={styles.secondary} onClick={() => void insertLessonCode()}>
            Start from my {lessonTitle ? `"${lessonTitle}"` : "lesson"} code
          </button>
        )}
      </div>

      <Field
        label="Results"
        hint="The numbers your code produced, and what they show."
        value={fields.resultSummary}
        onChange={(v) => update("resultSummary", v)}
        max={CAPSTONE_LIMITS.resultSummary}
      />

      <Field
        label="Reflection"
        hint="What could make your answer wrong? What would you try next?"
        value={fields.reflection}
        onChange={(v) => update("reflection", v)}
        max={CAPSTONE_LIMITS.reflection}
      />

      <div className={styles.actions}>
        <button type="button" className={styles.primary} disabled={saveState === "saving"} onClick={() => void save(true)}>
          {submitted ? "Save changes" : "Submit capstone"}
        </button>
        {!submitted && (
          <button type="button" className={styles.secondary} disabled={saveState === "saving"} onClick={() => void save(false)}>
            Save draft
          </button>
        )}
        <span className={styles.saveState} aria-hidden={saveState === "error" || undefined}>
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <section className={styles.share} aria-labelledby="share-title">
        <h2 id="share-title" className={styles.shareTitle}>Sharing</h2>
        {!submitted ? (
          <p className={styles.hint}>Only you and your teacher can see this. Once you submit, you can make a share link.</p>
        ) : capstone?.shareToken ? (
          <>
            <p className={styles.hint}>Anyone with this link can see your capstone (not your name). Turn it off any time and the link stops working.</p>
            <div className={styles.shareRow}>
              <input className={styles.input} readOnly value={shareUrl ?? ""} aria-label="Share link" onFocus={(e) => e.currentTarget.select()} />
              <button
                type="button"
                className={styles.secondary}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl ?? "");
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  } catch {
                    // Clipboard blocked: the link is selectable above.
                  }
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button type="button" className={styles.danger} disabled={sharing} onClick={() => void setShare(false)}>
              Stop sharing
            </button>
          </>
        ) : (
          <>
            <p className={styles.hint}>
              Private: only you and your teacher can see this. A share link shows your work without your name, for a
              college application or a portfolio. If you&apos;re under 18, check with a parent or guardian first.
            </p>
            <button type="button" className={styles.secondary} disabled={sharing} onClick={() => void setShare(true)}>
              Create a share link
            </button>
          </>
        )}
        <p className={styles.hint}>
          {openedByTeacher.length > 0
            ? `Your teacher last opened this ${formatDate(openedByTeacher[0])}.`
            : "Your teacher can open your capstone; each time they do, it shows up here."}
        </p>
      </section>
    </div>
  );
}
