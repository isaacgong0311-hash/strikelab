/**
 * StrikeLab Analytics
 * Thin wrapper around @vercel/analytics track() for all custom events.
 *
 * Usage:
 *   import { trackLessonStart } from "@/lib/analytics";
 *   trackLessonStart("lesson-3-black-scholes");
 *
 * All events are no-ops in dev (Vercel Analytics only fires in production).
 */

import { track } from "@vercel/analytics";
import { getAttribution } from "./attribution";

// ─── Lesson funnel ────────────────────────────────────────────────────────────

/** User clicks into a lesson page */
export function trackLessonStart(lessonId: string) {
  track("lesson_start", { lessonId });
}

/** User passes the coding exercise unit tests */
export function trackTestsPassed(lessonId: string) {
  track("tests_passed", { lessonId });
}

/** User clicks "Next lesson" — lesson fully complete */
export function trackLessonComplete(lessonId: string) {
  track("lesson_complete", { lessonId });
}

/** User answers a quiz question */
export function trackQuizAnswer(lessonId: string, correct: boolean) {
  track("quiz_answer", { lessonId, correct });
}

// ─── Playground ───────────────────────────────────────────────────────────────

/** User clicks Run in the playground */
export function trackPlaygroundRun() {
  track("playground_run");
}

// ─── Conversion funnel ────────────────────────────────────────────────────────

/** User clicks any "Upgrade to Pro" / "Start Free Trial" button */
export function trackUpgradeClick(source: string) {
  track("upgrade_click", { source, ...getAttribution() });
}

/** User clicks "Contact Sales" for the school plan */
export function trackSchoolClick(source: string) {
  track("school_click", { source, ...getAttribution() });
}

/** User submits the newsletter signup form */
export function trackNewsletterSignup() {
  track("newsletter_signup", getAttribution());
}

// ─── Engagement ───────────────────────────────────────────────────────────────

/** User interacts with the Greek visualizer sliders */
export function trackVisualizerInteraction(param: "S" | "K" | "T" | "r" | "sigma") {
  track("visualizer_interaction", { param });
}

// ─── Bite-sized sessions ──────────────────────────────────────────────────────

/** Learner opens a session in the session player */
export function trackSessionStart(sessionId: string) {
  track("session_start", { sessionId, ...getAttribution() });
}

/** Learner checks an answer on a question step */
export function trackStepAnswered(sessionId: string, stepId: string, kind: string, correct: boolean) {
  track("step_answered", { sessionId, stepId, kind, correct });
}

/** Learner reaches the session-complete screen */
export function trackSessionComplete(sessionId: string, accuracy: number, durationMs: number) {
  track("session_complete", { sessionId, accuracy, durationSec: Math.round(durationMs / 1000) });
}

// ─── Leader funnel (frontend plan FE-11) ──────────────────────────────────────
//
// Custom events only record on a paid Vercel plan; until then these are
// no-ops in production. The pilot's real funnel numbers come from Postgres
// (scripts/metrics/leader-funnel.sql), not from here. Never put names,
// emails or anything that identifies a student in these properties.

export type MarketingEvent = "hero_cta" | "demo_open" | "pilot_page_view" | "pilot_call_click" | "invite_copied";

// A page's own effects run before the root <Analytics /> sets up window.va,
// so an on-mount event would be dropped. Create the same queue the library
// does; its script drains it when it loads.
function ensureQueue() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { va?: (...params: unknown[]) => void; vaq?: unknown[][] };
  w.va ??= (...params) => {
    (w.vaq ??= []).push(params);
  };
}

export function trackMarketing(event: MarketingEvent, props: Record<string, string> = {}) {
  ensureQueue();
  // Explicit props win over first-touch attribution (e.g. the page-view src).
  track(event, { ...getAttribution(), ...props });
}

