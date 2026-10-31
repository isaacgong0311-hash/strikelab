/** Only a curriculum destination is stored, never answers, scores, or identity. */
export const LEARNING_NEXT_STEP_KEY = "strikelab:next-step:v1";
const CHANGE_EVENT = "strikelab:next-step-changed";

// Small, explicit allowlist keeps arbitrary URLs and the full curriculum out
// of the homepage client bundle. Tests resolve these against real content.
export const LEARNING_DESTINATIONS = {
  "/learn/inv-1.1": "Stock ownership · session 1",
  "/learn/inv-1.2": "Stock ownership · session 2",
  "/learn/inv-1.3": "Stock ownership · session 3",
  "/learn/inv-5.1": "Risk and diversification · session 1",
  "/learn/inv-5.2": "Risk and diversification · session 2",
  "/learn/inv-5.3": "Risk and diversification · session 3",
  "/lesson/inv-1": "Stock ownership · full lesson",
  "/lesson/inv-5": "Risk and diversification · full lesson",
  "/lesson/1": "Options and payoffs",
  "/lesson/q3": "Backtesting a strategy",
  "/lesson/3": "Build a Black-Scholes model",
} as const;

export type LearningDestination = keyof typeof LEARNING_DESTINATIONS;

export function isLearningDestination(value: unknown): value is LearningDestination {
  return typeof value === "string" && Object.hasOwn(LEARNING_DESTINATIONS, value);
}

export function parseLearningNextStep(raw: string | null): LearningDestination | null {
  try {
    const value: unknown = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== "object" || !("version" in value) || !("href" in value)) return null;
    return value.version === 1 && isLearningDestination(value.href) ? value.href : null;
  } catch {
    return null;
  }
}

/** Stable primitive snapshot for useSyncExternalStore; safe during SSR. */
export function readLearningNextStep(): LearningDestination | null {
  try {
    return parseLearningNextStep(window.localStorage.getItem(LEARNING_NEXT_STEP_KEY));
  } catch {
    return null;
  }
}

export function saveLearningNextStep(href: string | null): void {
  if (href !== null && !isLearningDestination(href)) return;
  try {
    if (href === null) window.localStorage.removeItem(LEARNING_NEXT_STEP_KEY);
    else window.localStorage.setItem(LEARNING_NEXT_STEP_KEY, JSON.stringify({ version: 1, href }));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage can be blocked or full. Learning continues without a bookmark.
  }
}

/** Completing unrelated content must never overwrite a saved suggestion. */
export function completeLearningNextStep(completedHref: string, nextHref: string | null = null): void {
  if (readLearningNextStep() !== completedHref) return;
  saveLearningNextStep(isLearningDestination(nextHref) ? nextHref : null);
}

/** Full-lesson completion also retires a bookmark for one of its sessions. */
export function completeSavedLesson(lessonId: string): void {
  const saved = readLearningNextStep();
  if (saved === `/lesson/${lessonId}` || saved?.startsWith(`/learn/${lessonId}.`)) {
    saveLearningNextStep(null);
  }
}

export function subscribeLearningNextStep(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LEARNING_NEXT_STEP_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function serverLearningNextStep(): null {
  return null;
}
