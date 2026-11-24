# The season as a path (Nov 24, 2026)

**Ask (Isaac, Nov 24):** /seasons feels like "a copy-paste USACO or AMC study site". Make it more unique and more like Duolingo. Think about the journey from a student's point of view, not just page details.

## What was wrong with the journey

1. **/seasons was a brochure, not a home base.** It had a headline, five rules, three cards, an empty leaderboard and an FAQ. A returning student had no "what do I do now".
2. **One challenge a week leaves six empty days.** The lessons that prepare each week were already built, but they appeared only as a small "Train first" link under each card.
3. **No sense of progress or reward.** Streak and XP existed for lessons, but the season page never showed them. Submitting a challenge ended on a plain line of text.
4. **Loops didn't close.** The practice round, the training lessons and a submitted challenge each sent you somewhere else, not back to your next step.
5. **The handle form was a side note**, even though a student can't start a challenge without a handle.

## What shipped (PR "season path")

- **A season path.** Warm-up, then for each week a training lesson and the challenge, then the record. Each week is a coloured unit with chunky nodes and a "Next up" marker. A big **Continue** button leads to the one next step: an open challenge first, then the earliest unfinished lesson for a week still ahead. Logic and tests are in `src/lib/seasons/path.ts`.
- **A stats bar for signed-in students:** day streak, lesson XP, season points out of the maximum, and rank under their handle.
- **A shorter, louder hero.** "Three weeks to prove you can do quant." plus fact chips and a dark countdown ticket. The rules moved to a side rail card.
- **The handle comes first.** With no handle, the form sits above the path.
- **Closed loops.**
  - The practice round ends on "Back to your season path".
  - Lessons 2 to 4 offer the path during the season.
  - A submitted challenge shows a medal and points back to the path.
- **Its own visual language**, written into `docs/ui-system.md` ("Seasons").

## Next, after the freeze (Dec 2 or later)

- **Daily reasons to come back during the season.** A 5-minute drill per week (no ranking) so the streak means something between challenges. This needs content, not schema.
- **Leagues view.** Show the board around you (the five above and below you), not just the top, once there are enough players.
- **Score reveal.** When a score posts, show it once as a moment on the path, with points added to the bar. This needs a "seen" flag; localStorage is enough.
- **Club unit.** Put the club board in the rail when the student is in a club.
