# Round Rock ISD Prospect List (v0)

**Prepared:** 2026-10-13. Companion file: `prospects-rrisd.csv`, in `crm.csv` format with `status: to_contact`.

## How this was built, and its limits
- Club names come from public search results about Round Rock ISD campuses. **The district's own sites (roundrockisd.org) could not be opened from the build environment**, so I have no sponsor names, emails or meeting times. I did not guess any.
- Every row has a source link. Several are partial or old, and each says so in `notes`.
- No private information. Advisor contact details come from the campus club pages when you open them.
- The file stays out of `crm.csv` until you verify rows. `npm run pipeline` counts anything in `crm.csv` that isn't marked `EXAMPLE`, so unverified rows would inflate your numbers.

## Your order of attack (outreach-kit §1)
1. **Tier 1 first: your own school.** Ask the sponsor of your school's investing, CS, math or DECA club in person (sprint plan §2). I can't tell which campus you attend, so no row is marked yours. Tell me and I'll reorder.
2. Tier 3: ask each of them "who runs a club like this at another RRISD campus?"
3. Tier 4 (this file): open the campus club page, copy the sponsor name and school email into the row, change `source` to `email-cold`, then move it to `crm.csv`.

## Tracking links
Use the tags in `outreach-kit.md` and add the campus: `strikelab.dev/demo?src=email-cold-rrhs`, `...-stonypoint`, `...-mcneil`. `src` accepts up to 64 characters and is stored at sign-up, so the scorecard can split by campus.

## Before you contact anyone
- Email teachers and sponsors, not students.
- RRISD may require approval before outside programs run in school. The pilot approval paths A, B and C are in `docs/gtm/pilot-agreement-checklist.md`. I could not read the district's policy, so confirm it with your sponsor.
- Don't copy a club's roster or member names into the CRM.
