"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useProgress } from "@/lib/useProgress";
import { buildSeasonPath, type PathChallengeInput, type PathStep, type PathUnit } from "@/lib/seasons/path";
import { parseReadiness, READINESS_EVENT, READINESS_KEY } from "@/lib/seasons/checklist";
import WeekStatus from "./WeekStatus";
import PathIcon, { LockBadge } from "./PathIcon";
import ScoreReveal from "./ScoreReveal";
import styles from "./path.module.css";

function subscribeReadiness(onChange: () => void) {
  window.addEventListener(READINESS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(READINESS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readReadiness(): string | null {
  try {
    return window.localStorage.getItem(READINESS_KEY);
  } catch {
    return null;
  }
}

export interface PathChallengeProps extends PathChallengeInput {
  /** Server-rendered countdown text, so the page reads right with JavaScript off. */
  initialText: string;
  opensLabel: string;
}

/**
 * The season drawn as a path. Server data decides the challenge steps; this
 * device (and the progress table, once signed in) decides the warm-up and
 * lessons. Everything renders without JavaScript: lessons just show as open.
 */
export default function SeasonPath({
  challenges,
  signedIn,
  serverNow,
  handle = null,
}: {
  challenges: PathChallengeProps[];
  signedIn: boolean;
  serverNow: string;
  /** Keys the score reveal, so two students on one device each see theirs. */
  handle?: string | null;
}) {
  const { completed } = useProgress();
  const readiness = parseReadiness(useSyncExternalStore(subscribeReadiness, readReadiness, () => null));
  const path = buildSeasonPath(challenges, { practiceDone: readiness.practice, completedLessons: completed, signedIn });
  const extra = new Map(challenges.map((c) => [c.id, c]));
  const current = path.units.flatMap((unit) => unit.steps).find((step) => step.key === path.currentKey);

  return (
    <div className={styles.path}>
      {signedIn && <ScoreReveal challenges={challenges} handle={handle} />}
      {current?.href && (
        <Link href={current.href} className={styles.continue}>
          <span className={styles.continueLabel}>{current.challenge?.view.kind === "started" ? "Resume your challenge" : current.kind === "challenge" ? "Your challenge is open" : "Continue"}</span>
          <span className={styles.continueTitle}>{current.title}</span>
          <svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true" focusable="false"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      )}
      <div className={styles.progress}>
        <p className={styles.progressText}>
          <strong>{path.done}</strong> of {path.total} steps done
        </p>
        <div className={styles.bar} role="progressbar" aria-label="Season path progress" aria-valuemin={0} aria-valuemax={path.total} aria-valuenow={path.done}>
          <span style={{ width: `${(path.done / Math.max(path.total, 1)) * 100}%` }} />
        </div>
      </div>
      {path.units.map((unit) => (
        <Unit key={unit.key} unit={unit} currentKey={path.currentKey} extra={extra} signedIn={signedIn} serverNow={serverNow} />
      ))}
    </div>
  );
}

function Unit({ unit, currentKey, extra, signedIn, serverNow }: {
  unit: PathUnit;
  currentKey: string | null;
  extra: Map<string, PathChallengeProps>;
  signedIn: boolean;
  serverNow: string;
}) {
  const done = unit.steps.filter((s) => s.state === "done").length;
  const challenge = unit.steps.find((s) => s.kind === "challenge")?.challenge;
  const when = challenge && challenge.view.kind === "upcoming" ? extra.get(challenge.id)?.opensLabel : null;
  return (
    <section className={styles.unit} data-tone={unit.tone} aria-labelledby={`unit-${unit.key}`}>
      <header className={styles.banner}>
        <div>
          <p className={styles.bannerLabel}>{unit.label}{when ? ` · opens ${when}` : ""}</p>
          <h3 id={`unit-${unit.key}`} className={styles.bannerTitle}>{unit.title}</h3>
        </div>
        {unit.steps.length > 1 && <p className={styles.bannerCount}>{done}/{unit.steps.length}</p>}
      </header>
      <ol className={styles.steps}>
        {unit.steps.map((step) => (
          <Step key={step.key} step={step} current={step.key === currentKey} extra={extra} signedIn={signedIn} serverNow={serverNow} />
        ))}
      </ol>
    </section>
  );
}

function kicker(step: PathStep, signedIn: boolean): string {
  switch (step.kind) {
    case "warmup": return signedIn ? "Practice · never ranked" : "Practice · no account needed";
    case "train": return `Train${step.duration ? ` · ${step.duration} lesson` : ""}`;
    case "challenge": return `Timed challenge · ${step.challenge?.minutes ?? 60} minutes`;
    case "record": return "Season record";
  }
}

function Step({ step, current, extra, signedIn, serverNow }: {
  step: PathStep;
  current: boolean;
  extra: Map<string, PathChallengeProps>;
  signedIn: boolean;
  serverNow: string;
}) {
  const linked = step.href && step.state !== "locked";
  const icon = <PathIcon kind={step.kind} state={step.state} slug={step.challenge?.templateSlug} />;
  const node = linked ? (
    <Link href={step.href!} className={styles.node} tabIndex={-1} aria-hidden="true">{icon}</Link>
  ) : (
    <span className={styles.node} aria-hidden="true">{icon}{step.state === "locked" && <span className={styles.lock}><LockBadge /></span>}</span>
  );
  const challenge = step.challenge ? extra.get(step.challenge.id) : undefined;

  return (
    <li className={styles.step} data-kind={step.kind} data-state={step.state} data-current={current || undefined}>
      <div className={styles.nodeCol}>{node}</div>
      <div className={styles.body}>
        {current && <p className={styles.next}>Next up</p>}
        <p className={styles.kicker}>{kicker(step, signedIn)}</p>
        <h4 className={styles.title}>{linked ? <Link href={step.href!}>{step.title}</Link> : step.title}</h4>
        {step.kind === "warmup" && (
          <p className={styles.detail}>{step.state === "done" ? "Done on this device. Run it again any time." : "Same editor and timer as the real thing. Nothing is saved or ranked."}</p>
        )}
        {step.kind === "train" && (
          <p className={styles.detail}>{step.state === "done" ? "Done. You've covered what this week tests." : "Covers exactly what this week's challenge tests."}</p>
        )}
        {step.kind === "challenge" && challenge && (
          signedIn ? (
            <WeekStatus view={challenge.view} challengeId={challenge.id} initialText={challenge.initialText} serverNow={serverNow} />
          ) : (
            <p className={styles.detail}>
              {challenge.view.kind === "upcoming" ? `Opens ${challenge.opensLabel}. Your own numbers, scored on our servers.`
                : challenge.view.kind === "open" ? <>Open now. <Link href="/sign-up?next=%2Fseasons">Create an account to start</Link>.</>
                : "Closed."}
            </p>
          )
        )}
        {step.kind === "record" && (
          <p className={styles.detail}>
            {step.state === "open" ? "Your scores and placing in one link you can share."
              : signedIn ? "Unlocks when your first score posts."
              : <>Your scores and placing in one link. Top placings get verified live. <Link href="/sign-up?next=%2Fseasons">Sign up free</Link> to start yours.</>}
          </p>
        )}
      </div>
    </li>
  );
}
