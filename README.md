# HealthLens

Astronaut health monitoring for long-duration missions. NASA Space Apps Challenge 2026, team **Hydrogen Temp** (Irvine).

Crewmates scan each other's skin. An AI model maps every mole and spot into a personal profile and flags anything new or changing. Vitals (heart rate, blood pressure, SpO₂) sit alongside, so each astronaut gets a clear **OK / Watch / Act** status and a next step, with no doctor on board.

- **Challenge:** [Create Health Monitoring Software for Astronauts on Space Missions](https://www.spaceappschallenge.org/)
- **Tasks (claim before you start):** [`docs/TASKS.md`](docs/TASKS.md)
- **PRD (source of truth):** [`docs/PRD.md`](docs/PRD.md)
- **Submission guide + live draft:** [`docs/SUBMISSION.md`](docs/SUBMISSION.md)
- **Working with Claude Code here:** [`CLAUDE.md`](CLAUDE.md)
- **Past-winner research:** [`docs/research/PAST-WINNERS.md`](docs/research/PAST-WINNERS.md)
- **Early concept:** [`docs/CONCEPT.md`](docs/CONCEPT.md)
- **Original brainstorm:** [`brainstorm.md`](brainstorm.md)

## Run it

```bash
cd app
npm install
npm run dev
```

Then open http://localhost:5173.

## Layout

```
app/                 Vite + React + TypeScript web app
  src/lib/types.ts       data model (reading, source, skin scan, lesion)
  src/lib/indicators.ts  indicator registry (thresholds, cadence)
  src/lib/store.ts       saves/loads all data in the browser
  src/lib/mockData.ts    seeded crew + history for the demo
  src/lib/analysis.ts    skin-scan analysis (mock for now, real model later)
  src/lib/status.ts      OK / Watch / Act rules
  src/lib/guides.ts      measurement guides (how / why / what to do)
  src/lib/emergency.ts   emergency step-by-step guides
  src/lib/environment.ts station / spacecraft / Moon / Mars settings
  src/pages/             Dashboard, Body map, Check-in, Skin, Vitals, Trends, Guides, Emergency
docs/PRD.md          product requirements (features, indicators, MVP cut)
docs/TASKS.md        who's doing what
docs/SUBMISSION.md   Space Apps rules + submission draft (kept current)
docs/DEMO-PLAN.md    7-slide demo plan (edit freely)
docs/research/       past-winner research
docs/CONCEPT.md      early concept (history)
brainstorm.md        team brainstorm + vote (history)
CLAUDE.md            instructions every teammate's Claude Code reads
.claude/             shared Claude Code settings + /update-submission skill
```

> Not a medical device. HealthLens flags changes for review; it does not diagnose.
