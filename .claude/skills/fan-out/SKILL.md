---
name: fan-out
description: Split a big StrikeLab goal into independent pieces and run them in parallel (subagents for read-heavy work, separate sessions or worktrees for code that ends in its own PR), then merge results safely. Use when a goal has several parts, when told "use subagents", "parallelize", "do all of these", or when working through the backlog in docs/PLAN.md.
---

# Fan out

Use more of the Max plan by running independent work at the same time, without two writers touching the same files.

## 1. Plan the split
Take the goal (or the next backlog items in `docs/PLAN.md`) and list the pieces. For each, decide:

| Piece looks like | Run it as | Why |
|---|---|---|
| Reading, searching, auditing, checking a page, running tests | **Subagent** (`Agent` tool): `Explore` for searching, `qa-walkthrough`, `season-doctor`, `claims-auditor`, `pr-reviewer` | Result comes back to you in this turn; keeps your context small |
| Code that ends in its own PR (a fix, a polish row, a feature) | **Own session in a worktree** (`start_session`, `use_worktree: true`) or a general-purpose subagent with `isolation: "worktree"` | Own branch, own PR, no collisions |
| Needs a previous piece's output | **Sequential**, after it | Do not fake parallelism |

Two code pieces may run together only if they touch different files. If unsure, run them one after the other. A piece that only verifies (tests, review) runs after the code it checks, not beside it.

## 2. Write each brief so it stands alone
Every brief names: the goal and why, the files or area, what "done" looks like (tests, screenshots, a PR), the rules that matter here (`docs/PLAN.md` working agreement, freeze dates, stop-doing list), and what to return (a short report, links, and anything unverified). Do not write "based on your findings". State the finding.

## 3. Launch
Send independent subagents in one message so they run concurrently. Start code sessions together. Tell the user in one line what is running and what is waiting.

## 4. Collect and land
- Read each result critically. A report is a claim, not proof: check the diff or the output yourself.
- Land PRs one at a time with the `ship` skill, smallest and most independent first. Rebase the rest on the new master and re-run their checks before merging.
- Migrations from any piece go in one list for Isaac, in apply order.
- Resolve conflicts yourself. If two pieces disagree on a design decision, pick one, say why, and move on.

## 5. Finish
One summary: what shipped (PR links), what is still open and why, what Isaac must do (migrations, SQL, messages), and the next backlog item. Update the checkboxes in `docs/PLAN.md`.

## Limits
- At most four parallel code sessions at once; more creates review debt.
- Never fan out work that needs Isaac's voice, a real person's inbox, money, or production writes. Those stay in the ask-first list.
