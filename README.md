# HealthLens

Astronaut health monitoring for long-duration missions. NASA Space Apps Challenge 2026, team **Hydrogen Temp** (Irvine).

Crewmates scan each other's skin. An AI model maps every mole and spot into a personal profile and flags anything new or changing. Vitals (heart rate, blood pressure, SpO₂) sit alongside, so each astronaut gets a clear **OK / Watch / Act** status and a next step, with no doctor on board.

- **Challenge:** [Create Health Monitoring Software for Astronauts on Space Missions](https://www.spaceappschallenge.org/)
- **Concept + MVP scope:** [`docs/CONCEPT.md`](docs/CONCEPT.md)
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
  src/lib/types.ts       data model (astronaut, skin scan, lesion, vitals)
  src/lib/mockData.ts    seeded crew + history for the demo
  src/lib/analysis.ts    skin-scan analysis (mock for now, real model later)
  src/lib/status.ts      OK / Watch / Act rules
  src/pages/             Dashboard, Skin, Vitals
docs/CONCEPT.md      the idea, how it maps to the challenge, MVP checklist
brainstorm.md        team brainstorm + vote
```

> Not a medical device. HealthLens flags changes for review; it does not diagnose.
