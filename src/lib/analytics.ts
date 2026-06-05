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
  track("upgrade_click", { source });
}

/** User clicks "Contact Sales" for the school plan */
export function trackSchoolClick(source: string) {
  track("school_click", { source });
}

/** User submits the newsletter signup form */
export function trackNewsletterSignup() {
  track("newsletter_signup");
}

// ─── Engagement ───────────────────────────────────────────────────────────────

/** User interacts with the Greek visualizer sliders */
export function trackVisualizerInteraction(param: "S" | "K" | "T" | "r" | "sigma") {
  track("visualizer_interaction", { param });
}
