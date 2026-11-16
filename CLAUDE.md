# HealthLens: Claude Code guide

NASA Space Apps 2026 hackathon entry by team Hydrogen Temp (Irvine local event).
**Submission deadline: Sunday Nov 15, 2026, 11:59 p.m. Pacific.** Speed matters; ship small, working increments.

## What we're building
Astronaut self-assessment health app. Headline feature: AI skin-lesion mapping that tracks every spot over time. Also vitals, mood, strength, vision, radiation dose, reminders, emergency guides, and environment modes.
Challenge: "Create Health Monitoring Software for Astronauts on Space Missions".

## Read first (in this order, only what you need)
1. `docs/TASKS.md`: who's doing what right now. **Claim a task before starting.**
2. `docs/PRD.md`: source of truth for features, priorities (P0/P1/P2), indicator table, MVP cut (§11).
3. `docs/SUBMISSION.md`: live draft of the Space Apps submission page + official rules.
4. `docs/DEMO-PLAN.md`: the 7-slide demo plan. Add demo ideas there; when you finish a feature that a slide is waiting on, update that slide's Status.
5. `docs/research/PAST-WINNERS.md`: patterns from past winners (only when writing pitch/submission content).

`docs/CONCEPT.md` and `brainstorm.md` are history; don't update them.

## Repo layout
- `app/`: Vite + React + TypeScript, browser-only, offline-first
  - `src/lib/types.ts` data model · `indicators.ts` indicator registry (thresholds, cadence) · `store.ts` the only place data is saved/loaded · `status.ts` OK/Watch/Act rules · `mockData.ts` seeded demo crew · `analysis.ts` skin AI (mock now)
  - `src/pages/` one file per screen · `src/components/` shared UI
- `docs/`: PRD, tasks, submission draft, research

## Commands (run from `app/`)
- `npm install` · `npm run dev` (http://localhost:5173) · `npm run build` (typecheck + build) · `npm run lint` · `npm test`
- Run `npm run build`, `npm run lint` and `npm test` before every commit that touches `app/`.

## How to build on the data layer (read before writing a feature)
- **Read data:** `const data = useData()` from `lib/store.ts` → `data.readings`, `data.skinScans`, `data.now`. Helper: `readingsFor(data, astronautId, 'heartRate')`.
- **Save data:** `addReading({ astronautId, indicator, value, takenAt, source })` or `addReadings([...])` (blood pressure = one `systolic` + one `diastolic` reading with the same `takenAt`); `addSkinScan(...)`. Never write to localStorage directly.
- **Every value has a `source`** (`manual`, `device`, `self-report`, `measured-in-app`, `simulated`, `estimated`). Forms use `indicatorById[id].entrySource`; a "simulate reading" button must save `simulated`. Show `<SourceTag source={...} />` next to any value on screen.
- **Status:** `evaluateAstronaut(id, data.readings, data.skinScans, data.now, data.symptomLogs)` → `status`, `headlines` (one line per indicator, for summaries), `reasons` (all), `indicators` (per-indicator latest / baseline / due). Don't re-implement thresholds in a component.
- **Environment:** `environmentById[data.environment]` from `lib/environment.ts` gives gravity, comm delay, body-mass method, shelter. Use it for anything that differs between station / spacecraft / Moon / Mars.
- **Guidance text:** measurement guides live in `lib/guides.ts` (`guideFor(indicatorId)`), emergency steps in `lib/emergency.ts`. Reuse them instead of writing new advice in a component. A new indicator should get a guide entry.
- **Insights and reminders:** `buildInsights(ev, env)` in `lib/insights.ts` gives one what / why / do / escalate card per flagged guide (text comes from `guides.ts`); `buildReport(...)` is the flight-surgeon text. `buildReminders(astronautId, ev, data.skinScans, data.now)` in `lib/reminders.ts` gives due / overdue checks. A new guide entry shows up in both automatically.
- **Charts:** use `<TrendChart>` from `components/TrendChart.tsx` (see `pages/Trends.tsx` for usage). One measure per chart, never two y-axes. Status colors (green / amber / red) are reserved for status; chart lines use `var(--series)`.
- **Body map:** regions and their body systems are in `lib/bodyRegions.ts`. An indicator shows up on the body map automatically through its `system` in the registry. The 3D view loads `public/models/body.glb` (BodyParts3D, CC BY 4.0: keep the credit under the figure); `lib/anatomy.ts` maps a 3D point to a body part. Rebuild the model only with `app/scripts/build-body.mjs` (instructions at its top).
- **Symptoms:** the list and rules are in `lib/symptoms.ts`; save with `addSymptomLog(...)`. They reach the status as reasons with `kind: 'symptom'`. Always pass `data.symptomLogs` to `evaluateAstronaut`, or that screen's status will miss them.
- **Devices** (`lib/devices.ts`, `components/DeviceSync.tsx` on Check-in): simulated devices modeled on real space hardware (CSA Bio-Monitor, NASA Actiwatch, SLAMMD, CSA Bio-Analyzer). `simulateSync(...)` returns readings with source `simulated` and a `device` id; pass `device` to `<SourceTag>` so the device name shows. To import a new indicator from a device, add it to that device's `measures`.
- **Emergencies** (`lib/emergency.ts`): each guide has a `priority` (1 life-threatening, 2 urgent, 3 serious), `signs`, optional `doNot`, `steps(env)`, `sources`, and optional `triggers` (urgent symptom ids, or an indicator at Act in a direction) that make `suggestEmergencies(...)` put it on top of the Emergency screen. `emergency.test.ts` checks every guide in every environment.
- **In-app tests** (`pages/Tests.tsx`): results are ordinary readings with source `measured-in-app`. A guide's `tab` says which screen its check is done on (`check-in` by default, `tests`, `skin`).
- **New indicator:** add its id to `IndicatorId` in `types.ts` and one entry in `INDICATORS` in `indicators.ts`. Rules, due/overdue, and the Vitals table pick it up automatically. Add a seed series in `mockData.ts` if the demo crew should have history for it.
- **Don't change the seeded demo story** (`mockData.ts` header comment) without updating `status.test.ts`; those tests lock in which astronaut shows which problem.

## Team workflow (whole team uses Claude Code on one repo)
- **Always `git pull --rebase` before starting and before pushing.** Teammates push to `main` constantly.
- Small commits, push often. One task = one commit or a few. Don't sit on unpushed work.
- To avoid conflicts, keep to the files your task owns. New screen → new file in `src/pages/`. Shared files (`types.ts`, `App.tsx`, `mockData.ts`) take small, additive edits only.
- If a rebase conflicts in a file you didn't change, keep the teammate's version and re-apply yours. Never force-push `main`.
- Update `docs/TASKS.md` when you start and finish a task (move it, add the commit hash).

## Keep the submission draft current (important)
After finishing any feature, data integration, or design decision, update `docs/SUBMISSION.md`:
- **Detailed Project Description**: add what the feature does and how it works (1–3 sentences).
- **NASA Data / Other References**: add every dataset, API, library, image source used, with exact names/IDs.
- **SI (AI) use log**: add which AI tool did what (code, images, text). AI-generated images/video need a visible watermark.
- **Demo shots**: note any screen worth showing in the demo.

Or run the `/update-submission` skill to do this from recent commits.

## Rules
- Not a medical device: the app flags changes for review and never diagnoses. Keep the footer disclaimer.
- Every number shown in the demo is either from a cited source or labeled "simulated".
- No NASA logos/branding in anything we generate.
- **No images, video, or audio of anyone under 18** in the demo or project (Space Apps rule). Use public dataset images (ISIC) for skin photos, not teammates.
- Functionality first, polish later (team decision). Keep UI clean and color-coded (green OK / amber Watch / red Act).
- Medical ranges and guidance in the app must match PRD §7 and be marked as reference values.
