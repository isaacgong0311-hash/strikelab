"use client";
import { useState } from "react";
import type { QuizQuestion } from "@/lib/quizzes";
import { trackQuizAnswer } from "@/lib/analytics";

const LETTERS = ["A", "B", "C", "D"] as const;

/**
 * A single quiz question placed inline, mid-lesson.
 *
 * The questions used to sit in one block at the very end, which meant you
 * could read 20 minutes of prose without once being asked to retrieve any of
 * it — and by the time you were asked, the early material was long gone.
 * Interleaving turns each one into a retrieval checkpoint at the moment the
 * relevant section is still fresh.
 */
export default function Checkpoint({
  question,
  lessonId,
  index,
  onAnswered,
}: {
  question: QuizQuestion;
  lessonId: string;
  index: number;
  /** Fires once, the first time this checkpoint is answered — lets the
   *  lesson page track when every question on the page has been seen. */
  onAnswered?: () => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  const isCorrect = chosen === question.correct;

  function choose(optIdx: number) {
    if (answered) return;
    trackQuizAnswer(lessonId, optIdx === question.correct);
    setChosen(optIdx);
    onAnswered?.();
  }

  return (
    <aside className={`cp${answered ? (isCorrect ? " correct" : " wrong") : ""}`}>
      <div className="cp-head">
        <span className="cp-label">Checkpoint {index}</span>
        {answered && (
          <span className="cp-verdict">{isCorrect ? "Correct" : "Not quite"}</span>
        )}
      </div>

      <p className="cp-q">{question.question}</p>

      <div className="cp-options">
        {question.options.map((opt, i) => {
          let cls = "cp-opt";
          if (answered) {
            if (i === question.correct) cls += " is-correct";
            else if (i === chosen) cls += " is-wrong";
            else cls += " is-dim";
          }
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={answered}>
              <span className="cp-letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && <p className="cp-explain">{question.explanation}</p>}
    </aside>
  );
}
