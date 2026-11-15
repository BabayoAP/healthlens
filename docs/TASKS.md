# Tasks

Claim a task by putting your name on it **and pushing** before you start. Move it to Done with the commit hash when finished.
Priorities and details come from [PRD §11 (MVP cut)](PRD.md#11-hackathon-mvp-cut-by-sunday). Deadline: **Sun Nov 15, 11:59 p.m. PT**.

## Owners (fill in)
| Person | Area |
| --- | --- |
| | App UI / dashboard / body figure |
| | Skin AI (real model call, lesion matching) |
| | Rules engine, measurement guides, emergency mode |
| | Data (NASA sources, demo data) + submission page |
| | Demo video/slides + pitch |

## To do (MVP, in priority order)
- [ ] Real skin-analysis call in `app/src/lib/analysis.ts` (keep mock as offline fallback). PRD §5.1
- [ ] Vitals + mood check-in entry forms, saved locally (IndexedDB/localStorage). PRD §5.2, §5.4
- [ ] Measurement guide cards (How / Why / If abnormal) for skin, HR, BP, SpO₂, mood. PRD §5.12
- [ ] Insights list: what / why / do / escalate. PRD §5.9
- [ ] Trend chart for one vital + skin timeline for one lesion. PRD §5.10
- [ ] Reminders: due/overdue list on dashboard. PRD §5.11
- [ ] Emergency mode with 2 guides (low SpO₂, solar particle event). PRD §5.13
- [ ] Environment switch (station vs Moon base). PRD §6
- [ ] Seeded worked example: one astronaut, two scans, escalation to Act. PRD §12
- [ ] Clickable body figure. PRD §5.8
- [ ] Verify indicator ranges in PRD §7 against sources; cite them
- [ ] Pick + cite NASA data actually used in the app (OSDR skin OSD-238/239/240/241/254, HRP risks, DONKI). PRD §9
- [ ] Deploy to a public URL (Vercel) and test in a private window
- [ ] Demo: 30-s video **or** ≤7 slides. See SUBMISSION.md
- [ ] Fill the Space Apps Project page from SUBMISSION.md and click **Submit for Judging**

## In progress
_(name · task · started)_

## Done
- [x] Repo renamed to healthlens, app skeleton, PRD v1, past-winner research, submission frame
