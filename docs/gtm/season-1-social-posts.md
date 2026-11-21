# Season 1: social account launch pack

Drafted by the agent on Nov 20, 2026. **Nothing here has been posted.** Isaac approves the exact text of every post before it goes out, and the account is Isaac's, created and signed in by him.

Builds on `season-1-outreach.md` (emails, forums, Reddit). Same rules apply, repeated because they are the ones that get broken:

1. **Only true claims.** Season 1 has not run. No user counts, schools, quotes, "trusted by", prizes, sponsors, or "FERPA/COPPA compliant". Say it is the first season.
2. **Don't DM students.** Posts and replies in public only. No collecting students' personal information outside the site's sign-up.
3. **Every link has a `?src=` tag** and every reply or lead goes in `crm.csv` the same day. Tags here: `x`, `ig`, `tiktok`, `linkedin`, `threads`.
4. **Facts you can use** (all checked against the code on Nov 20):
   - Season 1: **Nov 30 to Dec 20**, three weekly timed challenges, about one hour each.
   - Topics: put-call parity, Black-Scholes, option delta. Python, in the browser.
   - Free for students. Everyone gets their own randomized numbers. The AI tutor is off during an attempt. Leaderboards show handles only, never real names.
   - **Practice round**: `strikelab.dev/seasons/practice`, 15 minutes, no account, not scored or saved.
   - Add-to-calendar file: `strikelab.dev/seasons/calendar.ics`.

## Which platform first

One account, done well, beats four empty ones. Recommended order, because students find this through short, visual, low-friction posts and advisors find it through a teacher-shaped post:

| Channel | Audience | Why | Cost |
|---|---|---|---|
| **Instagram** (or TikTok) | Students | Where high schoolers actually are; the practice round is a good hook | Free |
| **X / Threads** | Students, quant-curious people, judges | Text-first, easy for the agent to draft; judges and finance people are here | Free |
| **LinkedIn** (Isaac's own profile, not a company page) | Advisors, teachers, finance people | Where the "judge a challenge" ask lands | Free |

Pick one to start. Posts below are written to work on any of them; shorten for X.

## Account setup (Isaac does the secret parts)

- Handle: something plain like `strikelab` or `strikelabdev`. Check availability first; do not buy anything.
- Bio (fits most platforms): *Free timed quant challenges for high schoolers. Season 1: Nov 30 to Dec 20. Try the practice round, no account needed.* Link: `strikelab.dev/seasons?src=<platform>`
- Use an email you control. Choose the password, complete any verification code or CAPTCHA yourself. The agent can fill the non-secret fields in the built-in browser and stop at those steps.
- Check the platform's age rules for the account holder before signing up.

## Posts (in order; each stands alone)

### 1. Announce (Mon Nov 23)
> Season 1 of StrikeLab starts Nov 30.
>
> Three weekly timed challenges in Python: put-call parity, Black-Scholes, option delta. Free for high schoolers.
>
> It's the first season, so the leaderboard starts empty. Come be on it.
>
> strikelab.dev/seasons?src=x

### 2. The practice round (Tue Nov 24). Best hook, lowest friction
> Want to see what a StrikeLab challenge feels like before one counts?
>
> 15 minutes. One short problem: price a forward by no-arbitrage. Your own random numbers, a clock that doesn't pause. No account. Not scored or saved.
>
> strikelab.dev/seasons/practice?src=x

### 3. What a challenge looks like (Wed Nov 25)
> What you get in a season challenge:
> - a short brief and your own randomized numbers
> - an editor with real Python, run in your browser
> - checks you can run before you submit
> - 2 or 3 sentences explaining your answer
>
> One submission. The AI helper is off while the clock runs.
>
> *(Attach a screenshot of the workspace, taken from the practice round on production. No real student data.)*

### 4. Fair play (Thu Nov 26)
> How we try to keep it fair:
> - every student gets different numbers, so copying an answer doesn't work
> - the server decides when time is up, not your laptop's clock
> - leaderboards show a handle you choose, never your name
>
> We can't promise zero cheating. We can make it hard. strikelab.dev/seasons?src=x

### 5. For advisors (Fri Nov 27). LinkedIn first
> If you advise a math team, investing club, CS club or DECA chapter: StrikeLab's Season 1 runs Nov 30 to Dec 20. Three one-hour challenges, free, about an hour a week for students.
>
> You make a free class, share the join link, and your club gets its own board. I'll set it up with you.
>
> This is the first season, so I can't point to past results yet. I can show you the challenges in 10 minutes.
>
> strikelab.dev/clubs?src=linkedin

### 6. Founder post (Sat Nov 28). **Isaac writes this one**
The agent will not invent your story. Fill in the blanks in your own words, then send it for review.
> I'm [age/grade], and I built StrikeLab because [one true sentence in your voice].
>
> [One specific thing that surprised you while building it.]
>
> Season 1 starts Nov 30. strikelab.dev/seasons?src=x

### 7. Add it to your calendar (Sun Nov 29)
> Tomorrow: Season 1 opens. Add it to your calendar so you don't miss week 1: strikelab.dev/seasons/calendar.ics
>
> Haven't tried it yet? The 15-minute practice round is open now: strikelab.dev/seasons/practice?src=x

### 8. Launch day (Mon Nov 30)
> Season 1 is live. Week 1 is open now.
>
> Free, three weekly challenges, handle-only leaderboard. Sign up, pick a handle, go: strikelab.dev/seasons?src=x

### 9. Replies to expect
| They ask | Reply |
|---|---|
| "Do I need to know Python?" | "Some helps. The free lessons on the site cover what the challenges use." |
| "Is it free?" | "Yes, seasons are free for students." |
| "Are there prizes?" | "Not this season. You get a record you can share, and we'll be honest about what it shows." (Only say this if still true.) |
| "Can my club join together?" | "Yes. Your advisor makes a free class and shares the join link; the club gets its own board." |
| "Who's behind it?" | "Me, a high school student, plus a teammate on outreach." (Say it plainly.) |

## Do not post
- Any number of sign-ups, students or schools until `docs/investor/claim-ledger.md` has a dated source for it.
- Screenshots with real names, emails or handles of real students.
- Anything promising prizes, internships, recruiting outcomes or that firms will see individual results.
- Replies to under-18 strangers in DMs. Move any private conversation to the advisor or parent.

## After each post
Log it in `crm.csv` (tag, date, what was said) and check `npm run pipeline` in the weekly 30 minutes. Kill rule from the Season 1 kit: under 30 students in Season 1 means the message or channel is wrong; change that before building more.
