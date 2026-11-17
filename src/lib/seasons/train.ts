/**
 * The lesson that prepares a student for each season challenge, shown on the
 * challenge cards. Keyed by `template_slug`; ids are lessons in src/lib/lessons.ts
 * (train.test.ts checks they exist).
 */
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
