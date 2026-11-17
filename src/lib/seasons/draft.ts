/**
 * Work-in-progress for a timed attempt, kept on the student's device so a
 * reload or a crashed tab doesn't cost them their code while the clock keeps
 * running. Never sent anywhere: it is cleared on submit, and scoped by user id
 * so a shared computer doesn't show one student another's draft.
 */
export interface Draft {
  code: string;
  explanation: string;
  savedAt: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const MAX_DRAFT_CODE = 50_000;
export const MAX_DRAFT_EXPLANATION = 2_000;

export function draftKey(scope: string, challengeId: string): string {
  return `strikelab:season-draft:v1:${scope}:${challengeId}`;
}

/** The browser's localStorage, or null where it's blocked (private windows, some school policies). */
export function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadDraft(storage: StorageLike | null, key: string): Draft | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Draft>;
    if (typeof value.code !== "string" || typeof value.explanation !== "string" || typeof value.savedAt !== "number") return null;
    return {
      code: value.code.slice(0, MAX_DRAFT_CODE),
      explanation: value.explanation.slice(0, MAX_DRAFT_EXPLANATION),
      savedAt: value.savedAt,
    };
  } catch {
    return null;
  }
}

/** Returns false when the draft couldn't be stored, so the page can say so. */
export function saveDraft(storage: StorageLike | null, key: string, draft: Draft): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(storage: StorageLike | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
