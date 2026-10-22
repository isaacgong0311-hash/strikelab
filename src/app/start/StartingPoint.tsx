"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { STARTING_QUESTIONS, recommendStartingPoint } from "@/lib/startingPoint";
import { saveLearningNextStep } from "@/lib/learningNextStep";
import { trackStartingPoint } from "@/lib/analytics";
import LearningNextStep from "@/components/LearningNextStep";
import styles from "@/components/marketing/marketing.module.css";
import local from "./start.module.css";

export default function StartingPoint() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const done = answers.length === STARTING_QUESTIONS.length;
  const question = STARTING_QUESTIONS[answers.length];

  function checkAnswer(answer: number) {
    if (answers.length === 0) trackStartingPoint("started");
    setSelected(answer);
    setChecked(true);
  }

  function advance() {
    const nextAnswers = [...answers, selected ?? -1];
    if (nextAnswers.length === STARTING_QUESTIONS.length) {
      const recommendation = recommendStartingPoint(nextAnswers);
      saveLearningNextStep(recommendation.href);
      trackStartingPoint("completed", recommendation.href);
    }
    setAnswers(nextAnswers);
    setSelected(null);
    setChecked(false);
    requestAnimationFrame(() => heading.current?.focus());
  }

  if (done) {
    const next = recommendStartingPoint(answers);
    const score = STARTING_QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
    return <section className={local.panel} aria-labelledby="check-heading">
      <h2 ref={heading} tabIndex={-1} id="check-heading" className={styles.h2}>Your next step</h2>
      <p className={styles.body}>
        You answered {score} of {STARTING_QUESTIONS.length} correctly.{" "}
        {score === STARTING_QUESTIONS.length
          ? "Try applying these ideas by building a pricing model. You can revisit any foundation along the way."
          : "Start with the earliest concept to revisit, then build toward a working model."}
      </p>
      <ul className={styles.list}>{STARTING_QUESTIONS.map((q, i) => <li key={q.id}>{q.skill}: {answers[i] === q.correct ? "correct on this check" : "worth revisiting"}</li>)}</ul>
      <div className={styles.ctaRow}>
        <Link href={next.href} prefetch={false} className={styles.primary} onClick={() => trackStartingPoint("lesson_click", next.href)}>
          {next.lesson} →
        </Link>
        <Link href="/lessons" className={styles.secondary}>See all lessons</Link>
      </div>
      <p className={styles.fine}>Your suggested lesson is saved on this device when browser storage is available. You can clear it from the homepage or before a new check.</p>
      <p className={styles.body}>Leading a group? <Link href="/demo">Explore the teacher demo</Link> or <Link href="/pilot?src=starting-point">start a free club pilot</Link>.</p>
      <button type="button" className={local.reset} onClick={() => {
        setAnswers([]);
        setSelected(null);
        setChecked(false);
        requestAnimationFrame(() => heading.current?.focus());
      }}>Try again</button>
    </section>;
  }

  return <section className={local.panel} aria-labelledby="check-heading">
    {answers.length === 0 && !checked && <LearningNextStep />}
    <p className={styles.kicker}>Question {answers.length + 1} of {STARTING_QUESTIONS.length} · {question.skill}</p>
    <h2 ref={heading} tabIndex={-1} id="check-heading" className={styles.h3}>{question.question}</h2>
    <fieldset className={local.options} disabled={checked}>
      <legend className="sl-visually-hidden">Choose an answer</legend>
      {question.options.map((option, index) => <label key={option} className={local.option}><input type="radio" name={question.id} value={index} checked={selected === index} onChange={() => setSelected(index)} />{option}</label>)}
    </fieldset>
    <div aria-live="polite">{checked && <p className={styles.note}><strong>{selected === question.correct ? "That's right. " : "Here's the idea. "}</strong>{question.explanation}</p>}</div>
    <div className={styles.ctaRow}>
      {checked ? (
        <button type="button" className={styles.primary} onClick={advance}>
          {answers.length === STARTING_QUESTIONS.length - 1 ? "See my next step" : "Next question"}
        </button>
      ) : (
        <>
          <button type="button" className={styles.primary} disabled={selected === null} onClick={() => selected !== null && checkAnswer(selected)}>
            Check answer
          </button>
          <button type="button" className={styles.secondary} onClick={() => checkAnswer(-1)}>
            I&apos;m not sure
          </button>
        </>
      )}
    </div>
  </section>;
}
