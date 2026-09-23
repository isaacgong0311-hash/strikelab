"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  chooseInitialCode,
  fetchSubmission,
  readLocalCode,
  saveSubmission,
  writeLocalCode,
  type CodeCopy,
} from "./sync";

/** Where the student's code currently lives, for the status line under the editor. */
export type CodeSyncStatus = "signed-out" | "device" | "saving" | "saved" | "retrying";

const SAVE_DELAY_MS = 2500;
const RETRY_DELAY_MS = 15000;

/**
 * Exercise code that follows the student across devices. Every edit is
 * written to localStorage immediately; signed-in edits are also saved to the
 * account a few seconds after typing stops. Local edits are never dropped
 * when the network or the table is unavailable.
 */
export function useSyncedCode(lessonId: string, starterCode: string) {
  const { user } = useAuth();
  const [code, setCodeState] = useState(() => readLocalCode(lessonId)?.code ?? starterCode);
  const [status, setStatus] = useState<CodeSyncStatus>("signed-out");

  const userIdRef = useRef<string | null>(null);
  const cloudRef = useRef(false);
  const editedRef = useRef(false);
  const pendingRef = useRef<CodeCopy | null>(null);
  const timerRef = useRef<number | null>(null);
  // Retries go through a ref so the callback doesn't reference itself.
  const retryRef = useRef<() => void>(() => {});

  const flush = useCallback(async (passed = false) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const supabase = getSupabaseBrowser();
    const userId = userIdRef.current;
    const copy = pendingRef.current ?? (passed ? readLocalCode(lessonId) : null);
    if (!supabase || !userId || !cloudRef.current || !copy) return;
    setStatus("saving");
    const result = await saveSubmission(supabase, userId, lessonId, copy, passed);
    if (result === "saved") {
      if (pendingRef.current === copy) pendingRef.current = null;
      setStatus(pendingRef.current ? "saving" : "saved");
    } else if (result === "unavailable") {
      cloudRef.current = false;
      setStatus("device");
    } else {
      setStatus("retrying");
      timerRef.current = window.setTimeout(() => retryRef.current(), RETRY_DELAY_MS);
    }
  }, [lessonId]);

  useEffect(() => {
    retryRef.current = () => void flush();
  }, [flush]);

  // Reconcile with the account copy when a student is (or becomes) signed in.
  useEffect(() => {
    userIdRef.current = user?.id ?? null;
    const supabase = getSupabaseBrowser();
    let active = true;
    (async () => {
      if (!user || !supabase) {
        cloudRef.current = false;
        if (active) setStatus("signed-out");
        return;
      }
      const remote = await fetchSubmission(supabase, user.id, lessonId);
      if (!active) return;
      if (remote === undefined) {
        cloudRef.current = false;
        setStatus("device");
        return;
      }
      cloudRef.current = true;
      const local = readLocalCode(lessonId);
      const choice = chooseInitialCode(local, remote, starterCode);
      if (choice.source === "remote" && remote && !editedRef.current) {
        setCodeState(remote.code);
        writeLocalCode(lessonId, remote);
        setStatus("saved");
      } else if (local && local.code !== remote?.code) {
        pendingRef.current = { code: local.code, updatedAt: local.updatedAt ?? new Date().toISOString() };
        await flush();
      } else {
        setStatus("saved");
      }
    })();
    return () => {
      active = false;
    };
  }, [user, lessonId, starterCode, flush]);

  // Save right away when the tab is hidden or the connection comes back.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && pendingRef.current) void flush();
    };
    const onOnline = () => {
      if (pendingRef.current) void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("online", onOnline);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [flush]);

  const setCode = useCallback((next: string) => {
    editedRef.current = true;
    setCodeState(next);
    const copy = { code: next, updatedAt: new Date().toISOString() };
    writeLocalCode(lessonId, copy);
    if (!cloudRef.current || !userIdRef.current) return;
    pendingRef.current = copy;
    setStatus("saving");
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void flush(), SAVE_DELAY_MS);
  }, [lessonId, flush]);

  /** Record a passing run (and the code that passed) on the account copy. */
  const markPassed = useCallback(() => {
    pendingRef.current = pendingRef.current ?? readLocalCode(lessonId) ?? { code, updatedAt: new Date().toISOString() };
    void flush(true);
  }, [lessonId, code, flush]);

  return { code, setCode, status, markPassed };
}

export const CODE_SYNC_LABELS: Record<CodeSyncStatus, string> = {
  "signed-out": "Saved on this device. Sign in to keep it on every device.",
  device: "Saved on this device.",
  saving: "Saving…",
  saved: "Saved to your account.",
  retrying: "Not saved to your account yet. Retrying, and your code is safe on this device.",
};
