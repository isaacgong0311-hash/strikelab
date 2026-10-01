# Market Sizing Worksheet (v0, 2026-10-01)

**Readiness plan item Y3.1.** Bottom-up, so a YC partner can check every step. The point isn't a big number; it's an honest one that shows which revenue rung (mega plan §8) the company actually depends on.

> **Every sourced input is unverified.** The research ran in an environment whose network blocked every source site; the figures come from web-search summaries on 2026-10-01. **Open each link and confirm the number before using it** (readiness plan Y8.8). Inputs marked **Assumption** have no source: they're our guesses, stated so they can be argued with.

## Inputs

| # | Input | Value | Source | Checked |
|---|---|---|---|---|
| I1 | US public secondary and high schools | 23,519 (2020–21) | NCES Fast Facts ([nces.ed.gov](https://nces.ed.gov/fastfacts/display.asp?id=84)) | ☐ |
| I2 | US private high schools | 3,626 | Same page, as reported in the search summary | ☐ |
| I3 | US public school students in grades 9–12 | 15.5 million (fall 2022) | NCES, Condition of Education ([nces.ed.gov](https://nces.ed.gov/programs/coe/indicator/cga/public-school-enrollment)) | ☐ |
| I4 | DECA high-school chapters | 4,492 (2024–25) | [deca.org/impact](https://www.deca.org/impact) | ☐ |
| I5 | DECA high-school members | 316,093 (2025–26) | Same page | ☐ |
| I6 | FBLA high-school members | 187,089 (July 31, 2025) | [fbla.org](https://www.fbla.org/media/2024/07/High-School-Membership-Poster_2024.pdf) | ☐ |
| I7 | AMC (math competition) reach | "300,000 students in over 4,000 schools" a year | [MAA](https://maa.org/student-programs/amc/) | ☐ |
| I8 | AP Statistics exam takers | 266,791 (2025) | [College Board](https://apstudents.collegeboard.org/about-ap-scores/score-distributions/2025) | ☐ |
| I9 | AP Computer Science A exam takers | 93,217 (2025) | Same page | ☐ |
| I10 | Club license price | $199 per year | StrikeLab pricing (`src/app/pricing/page.tsx`, `/pricing`) | ✅ (ours) |
| I11 | School license price | $499 per year per instructor | Same | ✅ (ours) |
| A1 | Share of US high schools with at least one club that could host StrikeLab (investing, math, CS, econ, DECA/FBLA, competition team) | 25% low, 50% high | **Assumption.** Sanity check: DECA chapters alone (I4) would be about 17% of all high schools (I1 + I2) if each were at a different school; AMC (I7) reaches over 4,000 schools | — |
| A2 | Blended price per paying school (some clubs, some school licenses) | $300 | **Assumption** (mega plan §8 uses the same) | — |
| A3 | Share of reachable schools that pay in a mature year | 5% low, 15% high | **Assumption** | — |

## Rung 1: club and school licenses

| Step | Low | High | Formula |
|---|---|---|---|
| US high schools | 27,145 | 27,145 | I1 + I2 |
| Schools with a host club (serviceable) | 6,786 | 13,573 | × A1 |
| Revenue if **every** one paid | $2.0M | $4.1M | × A2 |
| Revenue at a mature paying share | $102k | $611k | × A3 |

**What this says:** even if every high school with a plausible club paid, US club and school licenses top out at a few million dollars a year. **Licenses are the wedge and the proof of willingness to pay, not the business.** That matches the mega plan's own reading (§8: "100 paying orgs at a ~$300 blended price is only about $30k ARR").

## The rungs that could make it large (not sized yet)

| Rung | What has to be counted | Status |
|---|---|---|
| 2. District agreements ($3k–$20k per district, mega plan §8) | Number of US school districts; share with advanced-academics or CTE budgets | Not sized. Find the NCES district count and one or two published district edtech price points |
| 3. Parent-paid summer cohorts ($150–$400 per student) | Students motivated enough to pay, e.g. a share of AMC (I7), AP Stats/CS (I8, I9) and DECA/FBLA (I5, I6) participants | Not sized. **Do not add these populations together**: they overlap heavily |
| 4. Sponsored seats ($5k–$50k per sponsor) | Finance firms and foundations that fund K-12 programs | Not sized. Needs conversations, not a statistic |
| 5. Talent pipeline | Employers paying for access to verified student work | Not sized. Forage (competition map) is the reference model, for college students |

## How to use this in the application

- Lead with the bottom-up rung-1 math and say plainly that it's small.
- Then say which rung the pilots are testing next and what evidence would size it (one paid district conversation is worth more than any TAM figure).
- Never quote the 15.5 million students (I3) as the market. Students aren't the payer, and a partner will see through it.

## Next steps

1. Founder: open each link and tick "Checked" (about 20 minutes). Replace any number that differs.
2. Add the district count (rung 2) with a source.
3. After G4, replace assumptions A1–A3 with what the pipeline and pilots actually show (contacts per school, conversion to paid).
