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
- [ ] Measurement guide cards (How / Why / If abnormal) for skin, HR, BP, SpO₂, mood. PRD §5.12
- [ ] Insights list: what / why / do / escalate. PRD §5.9
- [ ] Trend chart for one vital + skin timeline for one lesion. PRD §5.10
- [ ] Reminders: due/overdue list on dashboard (the `due` flag per indicator already exists in `evaluateAstronaut`). PRD §5.11
- [ ] Emergency mode with 2 guides (low SpO₂, solar particle event). PRD §5.13
- [ ] Environment switch (station vs Moon base). PRD §6
- [ ] Clickable 2D SVG body figure + per-system detail panel. PRD §5.8
- [ ] In-app vision check (near-vision chart + Amsler grid) and reaction-time test. PRD §5.0, §5.6
- [ ] Symptom checklist. PRD §5.4
- [ ] Verify indicator ranges in PRD §7 against sources; cite them
- [ ] Pick + cite NASA data actually used in the app (OSDR skin OSD-238/239/240/241/254, HRP risks, DONKI). PRD §9
- [ ] Deploy to a public URL (Vercel) and test in a private window
- [ ] Demo: 7-slide deck with short GIFs (≤30 s of motion in total). Plan in DEMO-PLAN.md
- [ ] Fill the Space Apps Project page from SUBMISSION.md and click **Submit for Judging**

## In progress
_(name · task · started)_

**Dawson Phan · claimed Nov 14 evening. Touches only `analysis.ts` and `Skin.tsx`.**
- [ ] Real skin-analysis call in `app/src/lib/analysis.ts` (keep mock as offline fallback). PRD §5.1

## Done
- [x] Check-in screen (`pages/CheckIn.tsx`): vitals, body mass, sleep, mood/stress/fatigue; "Simulate reading" button; typo checks; shows what each saved value means. BabayoAP
- [x] **Foundation is in: build on it** (see "How to build on the data layer" in CLAUDE.md). BabayoAP:
  - Input source layer + `<SourceTag>` (every value says manual / device / self-report / measured-in-app / simulated / estimated)
  - Local data store `lib/store.ts` (`useData`, `addReading`, `addSkinScan`) + demo-mode toggle
  - Indicator registry `lib/indicators.ts` (10 indicators with cadence + thresholds)
  - Seeded 6-week history for 4 astronauts, one planned problem each, incl. the worked skin example
  - Rules: safety limits, own-baseline change, re-measure before escalating, sustained trend, missing measurements; 14 tests (`npm test`)
- [x] Repo renamed to healthlens, app skeleton, PRD v1, past-winner research, submission frame
