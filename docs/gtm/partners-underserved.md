# Underserved-Reach Partner Map (v0)

**Prepared:** 2026-10-15. Companion: `partners-underserved.csv`.

## Rules
- **Organizations and programs only. No people.** Nothing here names or contacts an individual. The founder or a trusted adult sends any message.
- **Evidence status is in every row.** Rows marked "NOT verified by search" come from general knowledge and must be searched before use. I did not find strong sources for most national organizations, because the search results were thin. That's a limit of the tool, not evidence either way.
- **Nobody is "served" yet.** None of these organizations has used StrikeLab. Don't write that StrikeLab serves any community until a named partner has run a cohort.

## A2. Choosing campuses from public data (method, not a list)
1. Download the federal school directory and school-level files from the National Center for Education Statistics, Common Core of Data ([nces.ed.gov/ccd](https://nces.ed.gov/ccd)). Join on the NCES school ID.
2. Keep Texas (state FIPS code 48), regular high schools, with the **Title I** flag and a **town or rural locale code** (distant or remote). Field names change by year; read that year's layout file first.
3. The result is a list of campuses. Add the campus website's public club page and nothing else. No student data.
4. I could not download the files from this environment. The method is documented so it can be run locally, or I can run it if the files can be reached.
5. Cross-check against the Texas Education Agency's own lists before treating a campus as a priority.

## What would make a row worth acting on
A public page that says the program runs in schools or sites serving low-income, rural or first-generation students, an age range that includes high school, a way to run a club without cost, and a contact path that is an organization's program office, not a private person.
