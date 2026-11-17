import { describe, expect, it } from "vitest";
import type { StorageLike } from "./draft";
import { buildChecklist, checklistProgress, markReadiness, parseReadiness, READINESS_KEY } from "./checklist";

const none = { practice: false, calendar: false };
const byId = (items: ReturnType<typeof buildChecklist>, id: string) => items.find((item) => item.id === id)!;

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("season checklist", () => {
  it("starts with nothing done for a brand-new student, in a useful order", () => {
    const items = buildChecklist({ handle: null, invited: 0, flags: none });
    expect(items.map((item) => item.id)).toEqual(["handle", "practice", "calendar", "invite"]);
    expect(checklistProgress(items)).toEqual({ done: 0, total: 4 });
    expect(byId(items, "invite").detail).toMatch(/Pick a handle first/);
    expect(byId(items, "invite").action).toBe("Pick a handle");
  });

  it("marks steps done from what the server and this device know", () => {
    const items = buildChecklist({ handle: "quant_kid", invited: 2, flags: { practice: true, calendar: false } });
    expect(checklistProgress(items)).toEqual({ done: 3, total: 4 });
    expect(byId(items, "handle")).toMatchObject({ done: true, detail: "You're @quant_kid on the boards." });
    expect(byId(items, "invite")).toMatchObject({ done: true, detail: "2 friends have joined through your link." });
    expect(byId(items, "calendar").done).toBe(false);
    expect(buildChecklist({ handle: "a_b", invited: 1, flags: none })[3].detail).toBe("1 friend has joined through your link.");
  });

  it("treats an unknown friend count (migration 0026 not applied) as not done, without claiming zero", () => {
    const item = byId(buildChecklist({ handle: "quant_kid", invited: null, flags: none }), "invite");
    expect(item.done).toBe(false);
    expect(item.detail).not.toMatch(/joined/);
    expect(item.href).toBe("/seasons");
  });

  it("downloads the calendar file rather than navigating to a page", () => {
    const calendar = byId(buildChecklist({ handle: "x_y", invited: 0, flags: none }), "calendar");
    expect(calendar).toMatchObject({ href: "/seasons/calendar.ics", download: true });
  });
});

describe("device flags", () => {
  it("round-trips, one step at a time, and ignores junk", () => {
    const store = memory();
    expect(parseReadiness(store.getItem(READINESS_KEY))).toEqual(none);
    markReadiness(store, "practice");
    expect(parseReadiness(store.getItem(READINESS_KEY))).toEqual({ practice: true, calendar: false });
    markReadiness(store, "calendar");
    expect(parseReadiness(store.getItem(READINESS_KEY))).toEqual({ practice: true, calendar: true });
    expect(parseReadiness("not json")).toEqual(none);
    expect(parseReadiness(JSON.stringify({ practice: "yes" }))).toEqual(none);
  });

  it("never throws when storage is missing or blocked", () => {
    expect(() => markReadiness(null, "practice")).not.toThrow();
    const broken: StorageLike = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => {},
    };
    expect(() => markReadiness(broken, "calendar")).not.toThrow();
  });
});
