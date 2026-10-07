import { describe, expect, it } from "vitest";
import { kickoffMinuteFor, TOUR_INITIAL, TOUR_SCENE_MS, TOUR_SCENES, TOUR_TICK_MS, tourReducer, type TourAction, type TourState } from "./tour";

const run = (state: TourState, actions: TourAction[]) => actions.reduce(tourReducer, state);
const ticks = (n: number): TourAction[] => Array.from({ length: n }, () => ({ type: "tick" }));
const TICKS_PER_SCENE = TOUR_SCENE_MS / TOUR_TICK_MS;

describe("guided demo", () => {
  it("is about 90 seconds long", () => {
    const seconds = (TOUR_SCENES.length * TOUR_SCENE_MS) / 1000;
    expect(seconds).toBeGreaterThanOrEqual(80);
    expect(seconds).toBeLessThanOrEqual(100);
  });

  it("does nothing on ticks until it plays", () => {
    expect(run(TOUR_INITIAL, ticks(100))).toEqual(TOUR_INITIAL);
  });

  it("advances one scene per scene length while playing", () => {
    const s = run(TOUR_INITIAL, [{ type: "play" }, ...ticks(TICKS_PER_SCENE)]);
    expect(s).toMatchObject({ index: 1, elapsed: 0, playing: true });
  });

  it("stops at the end, and playing again starts over", () => {
    const end = run(TOUR_INITIAL, [{ type: "play" }, ...ticks(TICKS_PER_SCENE * TOUR_SCENES.length + 10)]);
    expect(end).toMatchObject({ index: TOUR_SCENES.length - 1, playing: false, ended: true });
    expect(tourReducer(end, { type: "play" })).toEqual({ index: 0, elapsed: 0, playing: true, ended: false });
  });

  it("pause keeps the place; next, back and jumps stay in range and restart the scene", () => {
    const paused = run(TOUR_INITIAL, [{ type: "play" }, ...ticks(5), { type: "pause" }, ...ticks(5)]);
    expect(paused).toMatchObject({ index: 0, elapsed: 5 * TOUR_TICK_MS, playing: false });
    expect(run(TOUR_INITIAL, [{ type: "prev" }]).index).toBe(0);
    expect(run(TOUR_INITIAL, [{ type: "goto", index: 99 }]).index).toBe(TOUR_SCENES.length - 1);
    expect(run(paused, [{ type: "next" }])).toMatchObject({ index: 1, elapsed: 0 });
  });

  it("shows a full kickoff when stepped to by hand, and plays it through when playing", () => {
    expect(kickoffMinuteFor({ ...TOUR_INITIAL, index: 1 }, 10)).toBe(10);
    expect(kickoffMinuteFor({ index: 1, elapsed: TOUR_TICK_MS, playing: true, ended: false }, 10)).toBe(0);
    expect(kickoffMinuteFor({ index: 1, elapsed: TOUR_SCENE_MS * 0.4, playing: true, ended: false }, 10)).toBe(5);
    expect(kickoffMinuteFor({ index: 1, elapsed: TOUR_SCENE_MS, playing: true, ended: false }, 10)).toBe(10);
  });
});
