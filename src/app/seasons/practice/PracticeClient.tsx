"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import FocusBar from "@/components/seasons/FocusBar";
import Workspace, { type ChecksOutcome, type SubmitInput } from "@/components/seasons/Workspace";
import workspace from "@/components/seasons/workspace.module.css";
import styles from "@/components/marketing/marketing.module.css";
import { useAuth } from "@/lib/auth/AuthProvider";
import { friendlyPythonError } from "@/lib/pythonErrors";
import { loadPythonRuntime } from "@/lib/pythonRuntime";
import { browserStorage, clearDraft, draftKey } from "@/lib/seasons/draft";
import {
  clearPracticeState, describeResult, forgetFunctionProgram, loadPracticeState, newPracticeSeed, parsePracticeResult,
  PRACTICE_CONCEPT, PRACTICE_ENTRY, PRACTICE_MINUTES, PRACTICE_STARTER, PRACTICE_TITLE, practiceChecks, practiceParams,
  practicePrompt, savePracticeState, type PracticeResult, type PracticeState,
} from "@/lib/seasons/practice";
import { useHydrated } from "@/lib/useHydrated";
import { formatClock } from "@/lib/seasons/window";

const RULES = [
  "Practice rounds aren't scored, ranked or saved on StrikeLab's servers.",
  "The clock doesn't pause, even if you leave this page.",
  "Your code saves on this device as you type, so a reload won't lose it.",
  "Season challenges are scored on StrikeLab's servers with hidden checks. This round is checked in your browser.",
];

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

function Intro({ onStart }: { onStart?: () => void }) {
  return (
    <div className={workspace.page}>
      <FocusBar label="Practice round" backHref="/seasons" backLabel="Back to the season" />
      <section className={styles.section}>
        <div className={styles.narrow}>
          <p className={styles.kicker}>Practice round</p>
          <h1 className={styles.h1}>Try a season challenge before one counts.</h1>
          <p className={styles.lede}>
            A {PRACTICE_MINUTES}-minute round with the same workspace and rules as a season challenge. No account needed.
          </p>
          <ul className={styles.checks}>
            <li>One short problem: price a forward contract by no-arbitrage.</li>
            <li>Your own random numbers, and a countdown that doesn&apos;t pause.</li>
            <li>Write the Python, run the checks, then explain your answer in 2 or 3 sentences.</li>
            {RULES.slice(0, 1).map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
          <div className={styles.ctaRow}>
            <button type="button" className={styles.primary} onClick={onStart} disabled={!onStart}>
              Start the practice round
            </button>
            <Link href="/seasons" className={styles.secondary}>How a season works</Link>
          </div>
          <p className={styles.fine}>Python runs in your browser and loads the first time you run your code.</p>
        </div>
      </section>
    </div>
  );
}

interface Summary {
  result: PracticeResult | null;
  usedSeconds: number;
}

function Round() {
  const { user } = useAuth();
  const [state, setState] = useState<PracticeState>(
    () => loadPracticeState(browserStorage()) ?? { seed: newPracticeSeed(), startedAt: null },
  );
  const [summary, setSummary] = useState<Summary | null>(null);
  const lastResult = useRef<PracticeResult | null>(null);

  const params = useMemo(() => practiceParams(state.seed), [state.seed]);
  const deadline = state.startedAt === null ? null : state.startedAt + PRACTICE_MINUTES * 60_000;
  const key = draftKey("practice", String(state.seed));

  const getSecondsLeft = useCallback(
    () => (deadline === null ? 0 : Math.max(0, Math.floor((deadline - Date.now()) / 1000))),
    [deadline],
  );

  function start() {
    const next = { seed: state.seed, startedAt: Date.now() };
    savePracticeState(browserStorage(), next);
    setState(next);
  }

  function newRound() {
    clearDraft(browserStorage(), key);
    clearPracticeState(browserStorage());
    lastResult.current = null;
    setSummary(null);
    setState({ seed: newPracticeSeed(), startedAt: null });
  }

  const runChecks = useCallback(
    async (code: string): Promise<ChecksOutcome> => {
      lastResult.current = null;
      try {
        const runtime = await loadPythonRuntime();
        // A function the student has since deleted or renamed must not keep passing from an earlier run.
        const forget = forgetFunctionProgram(PRACTICE_ENTRY);
        if (forget) await runtime.runPython(forget);
        try {
          await runtime.runPython(code);
        } catch (e) {
          return { ok: false, text: friendlyPythonError(message(e), "code") };
        }
        let out: unknown;
        try {
          out = await runtime.runPython(practiceChecks(params));
        } catch (e) {
          return { ok: false, text: friendlyPythonError(message(e), "tests") };
        }
        const result = parsePracticeResult(out);
        if (!result) return { ok: false, text: "The checks didn't return a result. Run them again." };
        lastResult.current = result;
        return { ok: result.passed === result.total, text: describeResult(result) };
      } catch (e) {
        return { ok: false, text: message(e) };
      }
    },
    [params],
  );

  const onSubmit = useCallback(
    async ({ code }: SubmitInput) => {
      await runChecks(code); // a fresh result for exactly the code being finished
      const usedSeconds = state.startedAt === null ? 0 : Math.round((Date.now() - state.startedAt) / 1000);
      setSummary({ result: lastResult.current, usedSeconds: Math.min(usedSeconds, PRACTICE_MINUTES * 60) });
      clearPracticeState(browserStorage());
    },
    [runChecks, state.startedAt],
  );

  if (summary) {
    const { result, usedSeconds } = summary;
    return (
      <div className={workspace.page}>
        <FocusBar label="Practice round" backHref="/seasons" backLabel="Back to the season" />
        <section className={styles.section}>
          <div className={styles.narrow}>
            <p className={styles.kicker}>Practice complete</p>
            <h1 className={styles.h1}>
              {result ? (result.passed === result.total ? "Every check passed." : `${result.passed} of ${result.total} checks passed.`) : "Your code didn't run."}
            </h1>
            <p className={styles.lede} role="status">
              {result
                ? `You finished in ${formatClock(usedSeconds)} of ${PRACTICE_MINUTES}:00. Nothing from this round was saved or ranked.`
                : "No checks were scored. Nothing from this round was saved or ranked."}
            </p>
            <div className={styles.ctaRow}>
              {user ? (
                <Link href="/seasons" className={styles.primary}>See the Season 1 challenges</Link>
              ) : (
                <>
                  <Link href="/sign-up?next=%2Fseasons" className={styles.primary}>Create a free account to play Season 1</Link>
                  <Link href="/seasons" className={styles.secondary}>See the challenges</Link>
                </>
              )}
              <button type="button" className={styles.secondary} onClick={newRound}>Try another round</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (state.startedAt === null) return <Intro onStart={start} />;

  return (
    <Workspace
      mode="practice"
      title={PRACTICE_TITLE}
      concept={PRACTICE_CONCEPT}
      prompt={practicePrompt(params)}
      numbers={[
        { label: "S", value: String(params.S) },
        { label: "r", value: String(params.r) },
        { label: "T", value: String(params.T) },
      ]}
      rules={RULES}
      starterCode={PRACTICE_STARTER}
      draftKey={key}
      limitSeconds={PRACTICE_MINUTES * 60}
      getSecondsLeft={getSecondsLeft}
      runChecks={runChecks}
      onSubmit={onSubmit}
      leaveHref="/seasons"
      leaveLabel="Leave practice"
      timeUp={<button type="button" className={workspace.btn} data-primary="true" onClick={newRound}>Start a fresh round</button>}
    />
  );
}

export default function PracticeClient() {
  // The server renders the intro; the saved round (this device only) is read once the page is live.
  return useHydrated() ? <Round /> : <Intro />;
}
