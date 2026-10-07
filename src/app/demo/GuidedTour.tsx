"use client";
import { useEffect, useReducer, type ReactNode } from "react";
import KickoffLiveView from "@/app/teach/[id]/invite/KickoffLiveView";
import { DEMO_KICKOFF_MINUTES, demoKickoffAt } from "@/lib/demo/kickoff";
import {
  kickoffMinuteFor,
  TOUR_INITIAL,
  TOUR_SCENE_MS,
  TOUR_SCENES,
  TOUR_TICK_MS,
  tourReducer,
  type TourSceneId,
} from "@/lib/demo/tour";
import styles from "./tour.module.css";

/**
 * "Watch the six weeks": an auto-advancing walk through a sample club, built
 * from the real components (frontend plan FY-6). Plays on its own unless the
 * visitor prefers reduced motion; pause, back, next and the step list work by
 * keyboard. The server passes each scene's visual; the kickoff scene is
 * animated here from the tour's clock.
 */
export default function GuidedTour({ visuals }: { visuals: Partial<Record<TourSceneId, ReactNode>> }) {
  const [state, dispatch] = useReducer(tourReducer, TOUR_INITIAL);

  // Autoplay unless motion is reduced. The accessibility boot script resolves
  // the OS setting and the site's own toggle into <html data-motion>.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (document.documentElement.dataset.motion !== "reduce") dispatch({ type: "play" });
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!state.playing) return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), TOUR_TICK_MS);
    return () => window.clearInterval(id);
  }, [state.playing]);

  // Don't play to an empty room: pause when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") dispatch({ type: "pause" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const scene = TOUR_SCENES[state.index];
  const last = TOUR_SCENES.length - 1;

  return (
    <section className={styles.tour} aria-labelledby="tour-title">
      <h2 id="tour-title" className="sl-visually-hidden">
        Watch a club&apos;s six weeks
      </h2>

      <ol className={styles.steps} aria-label="Steps">
        {TOUR_SCENES.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={styles.step}
              aria-current={i === state.index ? "step" : undefined}
              onClick={() => dispatch({ type: "goto", index: i })}
            >
              <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
              {s.step}
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.head}>
        <div className={styles.caption} aria-live="polite" aria-atomic="true">
          <p className={styles.count}>
            Step {state.index + 1} of {TOUR_SCENES.length} · sample data
          </p>
          <h3 className={styles.title}>{scene.title}</h3>
          <p className={styles.text}>{scene.caption}</p>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.control} onClick={() => dispatch({ type: "prev" })} disabled={state.index === 0}>
            ← Back
          </button>
          <button
            type="button"
            className={`${styles.control} ${styles.play}`}
            onClick={() => dispatch({ type: state.playing ? "pause" : "play" })}
          >
            {state.playing ? "Pause" : state.ended ? "Replay" : "Play"}
          </button>
          <button type="button" className={styles.control} onClick={() => dispatch({ type: "next" })} disabled={state.index === last}>
            Next →
          </button>
        </div>
      </div>

      <div className={styles.bar} aria-hidden="true">
        <div className={styles.fill} style={{ transform: `scaleX(${state.elapsed / TOUR_SCENE_MS})` }} />
      </div>

      <div className={styles.stage} key={scene.id}>
        {scene.id === "kickoff" ? (
          <KickoffLiveView live={demoKickoffAt(kickoffMinuteFor(state, DEMO_KICKOFF_MINUTES))} />
        ) : (
          visuals[scene.id]
        )}
      </div>
    </section>
  );
}
