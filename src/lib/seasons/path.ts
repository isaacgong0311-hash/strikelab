/**
 * The season as a path: a warm-up, then for each week a training lesson and
 * the timed challenge, then the record at the finish line. The /seasons page
 * draws it; this file only decides what each step is and what state it's in.
 *
 * Challenge states come from the server (attempts, the calendar). Warm-up and
 * lesson states come from this device and the progress table (useProgress), so
 * they're filled in after hydration; before that every lesson reads "open".
 */
import type { WeekView } from "./status";

export type StepKind = "warmup" | "train" | "challenge" | "record";
/** done: finished. open: can be done now. locked: not yet. missed: the window closed without a submission. */
export type StepState = "done" | "open" | "locked" | "missed";

export interface PathChallengeInput {
  id: string;
  week: number;
  templateSlug: string;
  title: string;
  concept: string;
  minutes: number;
  view: WeekView;
  train: { lessonId: string; title: string; duration: string | null } | null;
}

export interface PathStep {
  key: string;
  kind: StepKind;
  state: StepState;
  title: string;
  href: string | null;
  /** Only on challenge steps. */
  challenge?: PathChallengeInput;
  lessonId?: string;
  duration?: string | null;
}

export interface PathUnit {
  key: string;
  /** "warmup", a week number, or "finish". */
  tone: "warmup" | 1 | 2 | 3 | 4 | "finish";
  label: string;
  title: string;
  steps: PathStep[];
}

export interface PathFlags {
  practiceDone: boolean;
  completedLessons: ReadonlySet<string>;
  signedIn: boolean;
}

export interface SeasonPath {
  units: PathUnit[];
  /** The one step to point at ("Next up"), or null when there is nothing to do. */
  currentKey: string | null;
  done: number;
  total: number;
}

export function challengeState(view: WeekView): StepState {
  switch (view.kind) {
    case "scored":
    case "submitted":
    case "pending_review":
      return "done";
    case "open":
    case "started":
      return "open";
    case "upcoming":
      return "locked";
    case "expired":
    case "closed":
      return "missed";
  }
}

function tone(week: number): PathUnit["tone"] {
  return (((week - 1) % 4) + 1) as 1 | 2 | 3 | 4;
}

export function buildSeasonPath(challenges: PathChallengeInput[], flags: PathFlags): SeasonPath {
  const ordered = [...challenges].sort((a, b) => a.week - b.week);
  const units: PathUnit[] = [{
    key: "warmup",
    tone: "warmup",
    label: "Warm-up",
    title: "See how a challenge feels",
    steps: [{
      key: "warmup",
      kind: "warmup",
      state: flags.practiceDone ? "done" : "open",
      title: "15-minute practice round",
      href: "/seasons/practice",
    }],
  }];

  for (const challenge of ordered) {
    const steps: PathStep[] = [];
    if (challenge.train) {
      steps.push({
        key: `train-${challenge.week}`,
        kind: "train",
        state: flags.completedLessons.has(challenge.train.lessonId) ? "done" : "open",
        title: challenge.train.title,
        href: `/lesson/${challenge.train.lessonId}`,
        lessonId: challenge.train.lessonId,
        duration: challenge.train.duration,
      });
    }
    const state = challengeState(challenge.view);
    steps.push({
      key: `week-${challenge.week}`,
      kind: "challenge",
      state,
      title: challenge.title,
      href: state === "locked" ? null : `/seasons/${encodeURIComponent(challenge.id)}`,
      challenge,
    });
    units.push({ key: `week-${challenge.week}`, tone: tone(challenge.week), label: `Week ${challenge.week}`, title: challenge.concept, steps });
  }

  const anyScored = ordered.some((c) => c.view.kind === "scored");
  units.push({
    key: "finish",
    tone: "finish",
    label: "Finish line",
    title: "Your record",
    steps: [{
      key: "record",
      kind: "record",
      state: flags.signedIn && anyScored ? "open" : "locked",
      title: "A record you can show",
      href: flags.signedIn ? "/record" : null,
    }],
  });

  const steps = units.flatMap((unit) => unit.steps);
  return {
    units,
    currentKey: pickCurrent(units),
    done: steps.filter((step) => step.state === "done").length,
    total: steps.length,
  };
}

/**
 * An open challenge always wins: it's the only thing on a clock. Otherwise the
 * earliest unfinished step in a unit that is still ahead (its challenge isn't
 * done or missed), so a lesson for a week that's over never shows as "next".
 * Then the record once there's something on it.
 */
function pickCurrent(units: PathUnit[]): string | null {
  for (const unit of units) {
    const challenge = unit.steps.find((step) => step.kind === "challenge");
    if (challenge?.state === "open") return challenge.key;
  }
  for (const unit of units) {
    const challenge = unit.steps.find((step) => step.kind === "challenge");
    if (challenge && (challenge.state === "done" || challenge.state === "missed")) continue;
    const step = unit.steps.find((s) => (s.kind === "warmup" || s.kind === "train") && s.state === "open");
    if (step) return step.key;
  }
  const record = units.at(-1)?.steps.find((step) => step.kind === "record");
  return record?.state === "open" ? record.key : null;
}

/** Sum of official scores so far, and the most the season's challenges can give. */
export function seasonPoints(views: WeekView[], perChallengeMax: number): { points: number; max: number } {
  const points = views.reduce((sum, view) => sum + (view.kind === "scored" && view.score !== null ? Number(view.score) : 0), 0);
  return { points: Math.round(points * 10) / 10, max: perChallengeMax * views.length };
}
