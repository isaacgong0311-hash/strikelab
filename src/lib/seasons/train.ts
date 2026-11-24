/**
 * The lesson that prepares a student for each season challenge, shown on the
 * challenge cards. Keyed by `template_slug`; ids are lessons in src/lib/lessons.ts
 * (train.test.ts checks they exist).
 */
import { PLANNED_SEASON } from "./planned";
import { seasonDate } from "./seasonDate";

export interface TrainLink {
  lessonId: string;
  label: string;
}

export const TRAIN_WITH: Readonly<Record<string, TrainLink>> = {
  "put-call-parity": { lessonId: "2", label: "Put-Call Parity" },
  "black-scholes-call": { lessonId: "3", label: "Black-Scholes Formula" },
  "call-delta": { lessonId: "4", label: "Delta: Directional Exposure" },
};

export function trainLinkFor(templateSlug: string): TrainLink | null {
  return Object.prototype.hasOwnProperty.call(TRAIN_WITH, templateSlug) ? TRAIN_WITH[templateSlug] : null;
}

/**
 * True when a lesson is the training step for one of this season's challenges
 * and the season hasn't ended, so the lesson can point back to the path.
 */
export function isSeasonTraining(lessonId: string, now: Date): boolean {
  if (seasonDate(now) > PLANNED_SEASON.endsOn) return false;
  return Object.values(TRAIN_WITH).some((link) => link.lessonId === lessonId);
}
