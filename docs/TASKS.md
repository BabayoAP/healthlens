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
- [ ] Demo: 7-slide deck with short GIFs (≤30 s of motion in total). Plan in DEMO-PLAN.md
- [ ] Fill the Space Apps Project page from SUBMISSION.md and click **Submit for Judging**

## In progress
_(name · task · started)_

## Done
- [x] Tests screen: vision check (tumbling-E near-vision chart, 8 rows, then Amsler grid per eye) and reaction-time test (5 tries, middle value). New indicators `reactionTime`, `nearVision`, `amsler`, saved as measured-in-app, with guides, sources, reminders, trends and body map (head). Seeded for the demo crew; Nakamura's reaction time slows with the sleep loss. `pages/Tests.tsx`. BabayoAP
- [x] Symptom checklist on the Check-in screen: 16 symptoms in 4 groups; any = Watch, 3 days in a row or an urgent one = Act, "No symptoms today" clears it. Feeds status, insights, body map and the report. `lib/symptoms.ts`, `components/SymptomChecklist.tsx`. Not seeded for the demo crew. BabayoAP
- [x] Live site moved to a Git-linked Vercel project: **https://healthlens-one.vercel.app** (team `health-lens`, root directory `app/`). Every push to `main` redeploys; no manual deploy needed. BabayoAP
- [x] Deployed to Vercel: https://app-tawny-mu-93.vercel.app (public, tested in a private window). Not linked to GitHub yet: redeploy by hand (`cd app && npx vercel deploy --prod --yes`). Dawson Phan (Superseded: this copy does not update on push.)
- [x] Insights screen: one card per finding with what we saw / why it matters in space / what to do / when to get help, plus how to reach the flight surgeon at the Act level (changes with environment); copy / download report for the flight surgeon. `lib/insights.ts`, `pages/Insights.tsx`. BabayoAP
- [x] Reminders: "Checks due" panel on the Dashboard (per crew member, each item opens the right screen) and a check schedule per astronaut. One check per guide; skin scan weekly. `lib/reminders.ts`, `components/RemindersPanel.tsx`. Not built: browser notifications, schedule changes by environment. BabayoAP
- [x] Follow-up from the sources task: SUBMISSION.md NASA Data + References tables and DEMO-PLAN slide 2 stat updated from `lib/sources.ts`; Dashboard space-weather panel checked in the browser (live DONKI data loads). BabayoAP
- [x] Skin scoring fix: a guessed size (no reference in frame) over 6 mm gives Watch, not Act; growth (E) only compared between measured sizes, otherwise "size not comparable". Found testing a benign ISIC image that scored Act. Tests in `lib/analysis.test.ts`. Dawson Phan
- [x] Sources: limits and guide facts checked against public sources and shown in the app (Guides screen: per-guide sources + "Where the numbers come from"). `lib/sources.ts`. Fixed: Mars delay 3 to 22 min, SpO2 act at 92% or lower. BabayoAP
- [x] NASA data in the app: live DONKI space-weather feed on the Dashboard (radiation watch, 1-hour cache, saved real snapshot offline), linked to the radiation storm guide; OSDR skin studies OSD-238/239/240/241/254 cited (IDs confirmed on OSDR). `lib/spaceWeather.ts`. BabayoAP
- [x] Body map: clickable 2D figure (7 parts, colored and marked by status, keyboard-friendly), detail panel with latest measurements, trend, skin scans of that area, why it changes in space, what to do, when to contact the medical officer. Dashboard cards now open it. `lib/bodyRegions.ts`, `pages/BodyMap.tsx`. BabayoAP
- [x] Trends screen: a chart per indicator with personal baseline and safety-limit lines, 2-week / 6-week range, hover / touch / arrow-key values, table view; size-over-time chart for each tracked skin spot. Reusable `components/TrendChart.tsx` (plain SVG, no chart library). BabayoAP
- [x] Measurement guides (8 cards: how / why in space / normal / if it looks wrong / when to get help), flagged ones open automatically, and shown after a flagged check-in. `lib/guides.ts`, `pages/Guides.tsx`. BabayoAP
- [x] Emergency mode: low oxygen + solar particle event, one step per screen, advice changes with comm delay. `lib/emergency.ts`, `pages/Emergency.tsx`. BabayoAP
- [x] Environment switch: station / spacecraft / Moon / Mars (`data.environment`, details in `lib/environment.ts`). Changes body-mass method, shelter step, comm advice. BabayoAP
- [x] **Real skin analysis** (Dawson Phan): Free OpenRouter vision model (Nemotron 3.5 Super VL → Gemma 4 → `openrouter/free`) returns spots as structured JSON; matching to the previous scan (new/changed/stable, same ID over time) is in code, and so is OK/Watch/Act; OpenRouter key entered on the Skin screen, stored in the browser only; simulated fallback when offline/no key. Live call not yet tested with a real key. PRD §5.1 · `d11874a`
- [x] Check-in screen (`pages/CheckIn.tsx`): vitals, body mass, sleep, mood/stress/fatigue; "Simulate reading" button; typo checks; shows what each saved value means. BabayoAP
- [x] **Foundation is in: build on it** (see "How to build on the data layer" in CLAUDE.md). BabayoAP:
  - Input source layer + `<SourceTag>` (every value says manual / device / self-report / measured-in-app / simulated / estimated)
  - Local data store `lib/store.ts` (`useData`, `addReading`, `addSkinScan`) + demo-mode toggle
  - Indicator registry `lib/indicators.ts` (10 indicators with cadence + thresholds)
  - Seeded 6-week history for 4 astronauts, one planned problem each, incl. the worked skin example
  - Rules: safety limits, own-baseline change, re-measure before escalating, sustained trend, missing measurements; 14 tests (`npm test`)
- [x] Repo renamed to healthlens, app skeleton, PRD v1, past-winner research, submission frame
