"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ACHIEVEMENTS, isUnlocked } from "@/lib/achievements";
import { getAllLessons, TRACKS } from "@/lib/tracks";
import { useProgress } from "@/lib/useProgress";
import styles from "./studentHome.module.css";

export default function StudentHomeClient() {
  const { completed, hydrated, streak } = useProgress();
  const lessons = getAllLessons();
  const nextLesson = lessons.find((lesson) => !completed.has(lesson.id));
  const completedCount = hydrated ? lessons.filter((lesson) => completed.has(lesson.id)).length : 0;
  const [cohort, setCohort] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/classes/joined")
      .then((response) => response.ok ? response.json() : { classes: [] })
      .then((data: { classes?: { id: string; name: string; isCohort?: boolean }[] }) => {
        const joined = data.classes?.find((item) => item.isCohort);
        if (active && joined) setCohort({ id: joined.id, name: joined.name });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const highlights = ACHIEVEMENTS
    .map((achievement) => ({ achievement, unlocked: hydrated && isUnlocked(achievement, completed) }))
    .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
    .slice(0, 4);
  const unlockedCount = hydrated ? ACHIEVEMENTS.filter((achievement) => isUnlocked(achievement, completed)).length : 0;

  return (
    <>
      <section className={styles.training} aria-labelledby="home-training-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Keep training</p>
            <h2 id="home-training-title">Your next lesson</h2>
          </div>
          {hydrated && streak > 0 && <span className={styles.streak}>{streak}-day streak</span>}
        </div>
        <div className={styles.trainingGrid}>
          <div className={styles.nextLesson}>
            <p className={styles.lessonLabel}>{nextLesson?.trackTitle ?? "Training complete"}</p>
            <h3>{nextLesson?.title ?? "You finished every lesson"}</h3>
            <p>{nextLesson?.subtitle ?? "Explore the season while new lessons are prepared."}</p>
            <Link href={nextLesson ? `/lesson/${nextLesson.id}` : "/lessons"}>{nextLesson ? "Continue lesson" : "Explore lessons"} <span aria-hidden="true">→</span></Link>
            {cohort && <Link className={styles.cohortLink} href={`/cohort/${cohort.id}`}>This week in {cohort.name}</Link>}
          </div>
          <div className={styles.progress}>
            <div className={styles.progressHead}><h3>Learning path</h3><span>{completedCount} / {lessons.length} lessons</span></div>
            {TRACKS.map((track) => {
              const done = hydrated ? track.lessons.filter((lesson) => completed.has(lesson.id)).length : 0;
              const percent = Math.round(done / track.lessons.length * 100);
              return (
                <div className={styles.track} key={track.id}>
                  <div><strong>{track.title}</strong><span>{done} / {track.lessons.length}</span></div>
                  <div className={styles.trackBar} role="progressbar" aria-label={`${track.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}%`}>
                    <span style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            <Link className={styles.pathLink} href="/lessons">View learning path →</Link>
          </div>
        </div>
      </section>
      <section className={styles.record} aria-labelledby="home-record-title">
        <div>
          <p className={styles.kicker}>Your proof</p>
          <h2 id="home-record-title">Build a record worth sharing.</h2>
          <p>Your season work, verified capstones, and certificates will come together here.</p>
        </div>
        <Link href="/record">See your record <span aria-hidden="true">→</span></Link>
      </section>
      <section className={styles.achievements} aria-labelledby="home-achievements-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.kicker}>Milestones</p><h2 id="home-achievements-title">Achievements</h2></div>
          <span>{unlockedCount} / {ACHIEVEMENTS.length} unlocked</span>
        </div>
        <div className={styles.achievementStrip}>
          {highlights.map(({ achievement, unlocked }) => (
            <div className={styles.achievement} key={achievement.id}>
              <span aria-hidden="true">{achievement.icon}</span>
              <strong>{achievement.name}</strong>
              <small>{unlocked ? "Unlocked" : "Still to earn"}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
