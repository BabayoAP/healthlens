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
- [ ] Insights list: what / why / do / escalate. PRD §5.9
- [ ] Reminders: due/overdue list on dashboard (the `due` flag per indicator already exists in `evaluateAstronaut`). PRD §5.11
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

**BabayoAP · claimed Nov 14 night. New files `components/TrendChart.tsx`, `pages/Trends.tsx`; one tab added in `App.tsx`.**
- [ ] Trend charts for every indicator + size-over-time for skin spots. PRD §5.10

## Done
- [x] Measurement guides (8 cards: how / why in space / normal / if it looks wrong / when to get help), flagged ones open automatically, and shown after a flagged check-in. `lib/guides.ts`, `pages/Guides.tsx`. BabayoAP
- [x] Emergency mode: low oxygen + solar particle event, one step per screen, advice changes with comm delay. `lib/emergency.ts`, `pages/Emergency.tsx`. BabayoAP
- [x] Environment switch: station / spacecraft / Moon / Mars (`data.environment`, details in `lib/environment.ts`). Changes body-mass method, shelter step, comm advice. BabayoAP
- [x] **Real skin analysis** (Dawson Phan): Claude vision call (`claude-opus-5-5`) returns spots as structured JSON; matching to the previous scan (new/changed/stable, same ID over time) is in code; API key entered on the Skin screen, stored in the browser only; simulated fallback when offline/no key. Live call not yet tested with a real key. PRD §5.1 · `d11874a`
- [x] Check-in screen (`pages/CheckIn.tsx`): vitals, body mass, sleep, mood/stress/fatigue; "Simulate reading" button; typo checks; shows what each saved value means. BabayoAP
- [x] **Foundation is in: build on it** (see "How to build on the data layer" in CLAUDE.md). BabayoAP:
  - Input source layer + `<SourceTag>` (every value says manual / device / self-report / measured-in-app / simulated / estimated)
  - Local data store `lib/store.ts` (`useData`, `addReading`, `addSkinScan`) + demo-mode toggle
  - Indicator registry `lib/indicators.ts` (10 indicators with cadence + thresholds)
  - Seeded 6-week history for 4 astronauts, one planned problem each, incl. the worked skin example
  - Rules: safety limits, own-baseline change, re-measure before escalating, sustained trend, missing measurements; 14 tests (`npm test`)
- [x] Repo renamed to healthlens, app skeleton, PRD v1, past-winner research, submission frame
