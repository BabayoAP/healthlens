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
4. `docs/research/PAST-WINNERS.md`: patterns from past winners (only when writing pitch/submission content).

`docs/CONCEPT.md` and `brainstorm.md` are history; don't update them.

## Repo layout
- `app/`: Vite + React + TypeScript, browser-only, offline-first
  - `src/lib/types.ts` data model · `mockData.ts` seeded demo crew · `analysis.ts` skin AI (mock now) · `status.ts` OK/Watch/Act rules
  - `src/pages/` one file per screen · `src/components/` shared UI
- `docs/`: PRD, tasks, submission draft, research

## Commands (run from `app/`)
- `npm install` · `npm run dev` (http://localhost:5173) · `npm run build` (typecheck + build) · `npm run lint`
- Run `npm run build` and `npm run lint` before every commit that touches `app/`.

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
