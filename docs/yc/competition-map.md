# Competition Map (v0, 2026-10-01)

**Readiness plan item Y3.2.** What else a club leader, a school or a student could use instead of StrikeLab, what each one does well, and where StrikeLab is different. Written for the YC "who are your competitors?" answer and for leader calls.

> **Every figure below is unverified.** The research ran in an environment whose network blocked every source site. The numbers come from web-search summaries on 2026-10-01; each one links to the page it's said to come from. **Open each link and confirm the number before it goes into the application, a pitch or a public page** (readiness plan Y8.8). Mark a row ✅ once checked.

## The short version

1. **Nobody else makes students write the model.** Simulators teach clicking (pick stocks, watch a balance). Financial-literacy curricula teach vocabulary. Competitions reward a pitch. StrikeLab is the only option in this map where a high-school student implements the pricing or the backtest themselves and finishes with code someone can inspect.
2. **The incumbents are big and free.** One free curriculum reports about 5 million students; free simulators report hundreds of thousands a year. Competing with them on price or reach is hopeless. StrikeLab should position as **the next step after them**, for the students who've outgrown the simulator, and as **preparation for the competitions** they already enter.
3. **The talent-pipeline layer exists, but for college students.** Forage and QuantConnect show employers will fund learning-to-opportunity programs. Neither is built for high schoolers or clubs. That's the long-term opening (mega plan §8, rung 5), not a near-term product.

## The map

| Category | Example | What it does | Who pays, price | Reach (unverified) | What StrikeLab does that it doesn't | Threat / opportunity |
|---|---|---|---|---|---|---|
| Stock simulator, curriculum-linked | **SIFMA Foundation Stock Market Game** | Teams manage a virtual portfolio; standards-based personal-finance curriculum; national and state contests | Usually through state council/coordinator programs; price not confirmed | "750,000 youth every year" ([SIFMA](https://www.sifma.org/about/sifma-foundation)) | Students build the pricing and risk models instead of picking stocks; a capstone instead of a ranking | Low threat (different job). **Opportunity:** the students who liked the game are StrikeLab's best prospects |
| Free stock simulator | **HowTheMarketWorks** | Free private class contests with real-time prices, a lesson library, teacher dashboards | Free (ad- or sponsor-supported; confirm) | "over 10,000 teachers and 475,000 students every year" ([howthemarketworks.com](https://www.howthemarketworks.com/)) | Code-first models, inspectable work, a fixed six-week program for clubs | Low. Teachers already know it; mention it as "keep using it, and add StrikeLab for the students who want the math" |
| Stock simulator platform | **StockTrak** (also runs the Wharton competition's simulation), Wall Street Survivor, Investopedia simulator | Paid or free simulators for classes and individuals | Mix of free and per-class licenses; confirm | Not found | Same as above | Low |
| Free financial-literacy curriculum | **Next Gen Personal Finance (NGPF)** | Free, full personal-finance curriculum, teacher training and certification | Free to teachers (philanthropy-funded) | "over 150,000 teachers", "5 million students" ([ngpf.org](https://www.ngpf.org/)) | Technical finance (options, risk, backtests) in code, not personal finance; for clubs, not required courses | Low on product, **high on mindshare**: teachers trust it, and it's free. Don't call StrikeLab "financial literacy" |
| Other literacy programs | Junior Achievement, Khan Academy personal finance | Personal finance lessons, volunteer-led programs | Free | Not checked | Same as NGPF | Low |
| Investment competition | **Wharton Global High School Investment Competition** | Teacher-advised teams of 4–7 manage a simulated portfolio and write an investment report | Free to enter (confirm) | "more than 5,000 registrations… more than 1,800 teams from 66 countries" in 2025 ([Wharton Global Youth](https://globalyouth.wharton.upenn.edu/news/announcing-the-semifinalists-in-the-2025-wharton-global-high-school-investment-competition/)) | Teaches the quantitative tools (valuation, risk, backtesting) a team needs to write a stronger report | **Opportunity, not threat.** "Six weeks of StrikeLab before your Wharton team forms" is a pitch to investing-club leaders who already enter |
| Business CTSOs | **DECA**, **FBLA** | Career and technical student organizations with finance events and competitive events | Student dues (FBLA: "$10 per student", [fbla.org](https://www.fbla.org/fbla-membership-dues/)) | DECA HS division "316,093" members in 2025–26 and "4,492 chapters" in 2024–25 ([deca.org/impact](https://www.deca.org/impact)); FBLA HS "187,089 members" as of July 31, 2025 ([fbla.org poster](https://www.fbla.org/media/2024/07/High-School-Membership-Poster_2024.pdf)) | A technical track their finance-minded members can't get from the events | **Distribution channel**, not competitor: chapter advisors are exactly the leaders StrikeLab targets |
| Student algo-trading league | **QuantConnect Quant League** | Quarterly algorithmic trading competition between student teams on QuantConnect | Free to students; QuantConnect is a paid platform for professionals | University teams; reported to end after Q4 2025, becoming "Strategies" ([QuantConnect](https://www.quantconnect.com/league/)) | Built for high schoolers from zero; teaches the models before the platform | Validates that quant firms sponsor student learning. Not aimed at high school |
| Virtual job simulations | **Forage** | Free employer-designed job simulations, including banking and finance | Employers pay; free to students | "Over 9 million students", "250+" simulations, "90+ employers" ([theforage.com](https://www.theforage.com/)) | Starts earlier (high school), goes deeper on technical skill, runs as a club program with a leader | The long-term model for rung 5 (employer-funded). Possible later partner, not a competitor now |
| General coding platforms | Codecademy, Khan Academy computing, Replit | Teach Python generally | Freemium | Not checked | Python applied to finance, with a club structure and a capstone | Low. StrikeLab is "a reason to code", not a coding course |

## What StrikeLab should say (and not say)

- **Say:** "Students write the models (Black-Scholes, the Greeks, a backtest) and finish with work they can show. Your leader runs it from a weekly plan and a scorecard."
- **Say:** "Keep the stock game. This is what comes after it."
- **Don't say:** "financial literacy" (NGPF owns that, free), "stock market game" (SIFMA and HowTheMarketWorks own that, free), or "the only…" claims we haven't checked.

## Honest weaknesses against this field

- No brand, no track record, no standards-alignment documentation that schools recognize yet.
- Simulators and NGPF are free and teachers already use them; StrikeLab's price has to be justified by outcomes (the pilots).
- Several competitors have real-time market data; StrikeLab doesn't (deliberately, for now).
- One founder; most of these are organizations with staff.

## Open questions to answer from leader calls

1. Which of these does each leader's club already use, and what do they wish it did?
2. Do investing-club leaders think of the Wharton competition as their main goal? (If yes, lead with "prep for Wharton".)
3. Would a DECA or FBLA chapter advisor run a technical program, or is it out of scope for their events?

Log answers in `docs/gtm/interview-log.csv` and update this page.
