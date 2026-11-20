/**
 * The "get ready" checklist on a new student's home: the four things that make
 * the first challenge go well. Two steps are facts the server knows (the handle,
 * friends who joined); two are things the student did on this device (finished
 * the practice round, downloaded the calendar), kept in localStorage because
 * neither is recorded on the server.
 */
import type { StorageLike } from "./draft";

export const READINESS_KEY = "strikelab:season-ready:v1";
/** Fired on this window when a flag changes, since the `storage` event only reaches other tabs. */
export const READINESS_EVENT = "strikelab:season-ready";

export type DeviceStep = "practice" | "calendar";
export type ReadyStep = "handle" | DeviceStep | "invite";

export interface ReadinessFlags {
  practice: boolean;
  calendar: boolean;
}

export interface ChecklistItem {
  id: ReadyStep;
  title: string;
  detail: string;
  done: boolean;
  href: string;
  action: string;
  /** The link downloads a file instead of opening a page. */
  download?: boolean;
}

export function parseReadiness(raw: string | null | undefined): ReadinessFlags {
  try {
    const value = raw ? (JSON.parse(raw) as Partial<Record<DeviceStep, unknown>>) : {};
    return { practice: value.practice === true, calendar: value.calendar === true };
  } catch {
    return { practice: false, calendar: false };
  }
}

/** Remember that this device did a step. Never throws: the checklist still works without it. */
export function markReadiness(storage: StorageLike | null, step: DeviceStep): void {
  if (!storage) return;
  try {
    const next = { ...parseReadiness(storage.getItem(READINESS_KEY)), [step]: true };
    storage.setItem(READINESS_KEY, JSON.stringify(next));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(READINESS_EVENT));
  } catch {
    // Storage blocked or full: the step just won't show as done.
  }
}

export function buildChecklist(input: { handle: string | null; invited: number | null; flags: ReadinessFlags }): ChecklistItem[] {
  const { handle, invited, flags } = input;
  const friends = (n: number) => `${n} ${n === 1 ? "friend has" : "friends have"} joined through your link.`;
  return [
    {
      id: "handle",
      title: "Pick your leaderboard handle",
      detail: handle ? `You're @${handle} on the boards.` : "Boards show this instead of your name.",
      done: Boolean(handle),
      href: "/seasons",
      action: "Pick a handle",
    },
    {
      id: "practice",
      title: "Try the practice round",
      detail: flags.practice ? "Done on this device." : "15 minutes, no account needed, nothing saved or ranked.",
      done: flags.practice,
      href: "/seasons/practice",
      action: "Start",
    },
    {
      id: "calendar",
      title: "Add the challenge dates to your calendar",
      detail: flags.calendar ? "Downloaded on this device." : "A reminder when each week opens and on its last day.",
      done: flags.calendar,
      href: "/seasons/calendar.ics",
      action: "Download",
      download: true,
    },
    {
      id: "invite",
      title: "Invite a friend",
      detail: !handle
        ? "Pick a handle first, then share your link."
        : invited !== null && invited > 0
          ? friends(invited)
          : "Share your link from the season page. Seasons are more fun against people you know.",
      done: invited !== null && invited > 0,
      href: "/seasons",
      action: handle ? "Get your link" : "Pick a handle",
    },
  ];
}

export function checklistProgress(items: ChecklistItem[]): { done: number; total: number } {
  return { done: items.filter((item) => item.done).length, total: items.length };
}
