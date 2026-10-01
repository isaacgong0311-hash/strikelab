/**
 * The guided demo on /demo?view=tour (frontend plan FY-6): about 90 seconds
 * through a club's six weeks, built from the same components leaders and
 * students use, on sample data. This file is the pure part: the scenes and the
 * player's state machine, so timing can be tested without a browser.
 */

export const TOUR_SCENES = [
  {
    id: "setup",
    step: "Set up",
    title: "A leader sets up the lab in about three minutes",
    caption: "Pick a start date. StrikeLab schedules all six weeks, skips break weeks, and makes one join link.",
  },
  {
    id: "kickoff",
    step: "Kickoff",
    title: "Kickoff day: watch students join",
    caption: "During the first meeting the leader sees who has joined and who is stuck, and walks over to help.",
  },
  {
    id: "student-week",
    step: "A student's week",
    title: "Every student sees one next step",
    caption: "This week's lessons and the Friday due date. Nothing to install: it runs on any school Chromebook.",
  },
  {
    id: "code",
    step: "Write the code",
    title: "Students write the real model",
    caption: "In week 3 they implement Black-Scholes in Python, in the browser, and tests check their answer.",
  },
  {
    id: "week-3",
    step: "Week 3",
    title: "The scorecard shows who needs a nudge",
    caption: "Activation, weekly activity and who's falling behind, without the leader grading anything.",
  },
  {
    id: "week-4",
    step: "Week 4",
    title: "Retention is measured, not guessed",
    caption: "Week-4 retention is counted from real completion dates: the number that says whether students stay.",
  },
  {
    id: "capstone",
    step: "Capstone",
    title: "Week 6: every student finishes with work they can show",
    caption: "A question, code that answers it and an honest result. Private by default; sharing is opt-in.",
  },
  {
    id: "outcome",
    step: "Outcome",
    title: "After six weeks: the outcome, in one export",
    caption: "Completion, retention and capstones per student, ready for the club, the school or a college application.",
  },
] as const;

export type TourSceneId = (typeof TOUR_SCENES)[number]["id"];

/** Time on each scene while playing. 8 scenes x 11s is about 90 seconds. */
export const TOUR_SCENE_MS = 11_000;
export const TOUR_TICK_MS = 250;

export interface TourState {
  index: number;
  /** Milliseconds spent on the current scene while playing. */
  elapsed: number;
  playing: boolean;
  /** True once the last scene has played out. */
  ended: boolean;
}

export type TourAction =
  | { type: "tick" }
  | { type: "play" }
  | { type: "pause" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "goto"; index: number };

export const TOUR_INITIAL: TourState = { index: 0, elapsed: 0, playing: false, ended: false };

const LAST = TOUR_SCENES.length - 1;
const clamp = (i: number) => Math.max(0, Math.min(LAST, i));

export function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case "tick": {
      if (!state.playing) return state;
      const elapsed = state.elapsed + TOUR_TICK_MS;
      if (elapsed < TOUR_SCENE_MS) return { ...state, elapsed };
      if (state.index < LAST) return { ...state, index: state.index + 1, elapsed: 0 };
      return { ...state, elapsed: TOUR_SCENE_MS, playing: false, ended: true };
    }
    case "play":
      // Playing again after the end starts over.
      return state.ended ? { index: 0, elapsed: 0, playing: true, ended: false } : { ...state, playing: true };
    case "pause":
      return { ...state, playing: false };
    case "next":
      return { ...state, index: clamp(state.index + 1), elapsed: 0, ended: false };
    case "prev":
      return { ...state, index: clamp(state.index - 1), elapsed: 0, ended: false };
    case "goto":
      return { ...state, index: clamp(action.index), elapsed: 0, ended: false };
  }
}

/**
 * Minutes into the kickoff to show. While playing, the kickoff scene plays
 * through the first meeting over most of the scene; paused or stepped to by
 * hand, it shows the meeting's end state (everyone joined) rather than an
 * empty room.
 */
export function kickoffMinuteFor(state: TourState, totalMinutes: number): number {
  if (!state.playing && state.elapsed === 0) return totalMinutes;
  return Math.min(totalMinutes, Math.floor((state.elapsed / (TOUR_SCENE_MS * 0.8)) * totalMinutes));
}
