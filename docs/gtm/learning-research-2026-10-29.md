# Making short finance lessons less passive

**Research and product note — October 29, 2026.** This is a product hypothesis, not a claim that StrikeLab improves retention or outperforms another app. No learner interviews or production funnel data were available for this note.

## What the evidence suggests

- [A review of retrieval practice](https://pubmed.ncbi.nlm.nih.gov/33006925/) finds that recalling material soon after learning can slow forgetting across ages and material types. This supports asking learners to decide or calculate before moving on, instead of adding more prose.
- The [IES practice guide](https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf) recommends retrieval opportunities with corrective feedback when errors are likely. StrikeLab's retry queue already does this; the next task is making the feedback useful enough to support the retry.
- [Duolingo says it reviews mistakes and uses spaced repetition](https://blog.duolingo.com/spaced-repetition-for-learning/), and [its Practice tab now offers free mistake review](https://blog.duolingo.com/guide-to-duolingo-practice-hub/). Repeating missed items is therefore a baseline, not a differentiator by itself.
- [Khan Academy reports making its AI help more direct after a wrong attempt](https://blog.khanacademy.org/four-things-to-look-for-in-edtech-and-how-khan-academy-measures-up/). Its [math tutoring update](https://blog.khanacademy.org/khanmigo-math-computation-and-tutoring-updates/) also says access to author-written steps and solutions improved tutor accuracy in its review. This supports grounding StrikeLab's optional AI explanation in a known question and explanation.

## Product hypothesis and first slice

**Inference from a repo review:** StrikeLab's long options introduction makes a learner read several screens before making a decision. A shorter path framed as a desk assignment, with a calculation and an immediate retry, may reduce passive reading. A learner who misses a question may need an explanation of *their specific wrong choice*, not another general summary.

The first slice converts “What Is an Option?” into three short sessions: choosing a call or put, computing a call payoff and net profit, and separating intrinsic from extrinsic value. After a wrong answer, a signed-in learner can ask for one additional AI explanation. The request uses the server's question, answer key and author-written explanation, counts against the existing AI quota, and respects the class and active-season-attempt AI switch. The written feedback and retry remain available without AI.

The product should be compared with Duolingo on **learning and usable work**, not animation or streak count. StrikeLab's distinct outcome is that a student can explain a payoff and implement the model in Python after the short sessions.

## Validate before expanding

Ask five consented learners to try the new options path and describe where they hesitate or lose interest; ask two club leaders whether the resulting work is easier to discuss than the long lesson alone. Record observations in the existing interview log, without personal details in this public repo.

Use existing `session_start`, `step_answered`, and `session_complete` events plus `mistake_explanation_requested` to compare first-session completion and correct answers on the retry. Keep the denominator and observation window explicit. AI help is a costed tool, so also count requests per completed session. These metrics are not yet measured; do not make an effectiveness claim until they are.
