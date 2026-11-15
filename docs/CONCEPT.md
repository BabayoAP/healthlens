# HealthLens — Concept

**NASA Space Apps 2026 · Team Hydrogen Temp · Irvine local event (Nov 14–15)**

## The challenge (Prompt 1)

> **Create Health Monitoring Software for Astronauts on Space Missions** — *Intermediate · Human Exploration, Software, Space Exploration*
>
> Long-duration missions expose astronauts to space radiation, isolation and confinement, altered gravity, and a hostile closed environment, which can bring immune changes, bone loss, cardiovascular events, and behavioral health problems. On long missions, astronauts carry much of the responsibility for spotting these changes in themselves. Your challenge is to build a health monitoring software that gathers health indicators and enables astronauts to evaluate and act on the status of their health.

## The idea

A body-scan health check (in the style of a full-body skin-check clinic) built as software for a crew with no doctor on board.

1. **Skin scans.** Crewmates photograph each other's skin by body region. Each scan is saved to that astronaut's log.
2. **AI lesion mapping.** Each scan goes through a vision model (same pattern as AquaPlot: photo → structured reading). The model finds and labels every mole, bump and blotch, then builds a personal skin profile for each astronaut.
3. **Change detection.** New scans are compared against the profile. New or changing spots (size, color, border, shape) get flagged early. Radiation exposure raises skin-cancer risk, so catching melanoma early matters most in space.
4. **Vitals and metabolic data.** Heart rate, blood pressure and other metabolic checks feed the same profile.
5. **Act on it.** Every flag comes with a clear status (OK / Watch / Act) and a next step, so the astronaut can decide what to do without waiting on ground control.

## How it maps to the challenge

| Challenge risk | HealthLens signal |
| --- | --- |
| Space radiation | Skin lesion change detection; cumulative dose log |
| Cardiovascular events | HR / BP trends against the astronaut's own baseline |
| Bone loss | (stretch) exercise + calcium/metabolic log |
| Immune changes | (stretch) skin rash / infection flags from scans |
| Behavioral health | (stretch) short mood / sleep check-in |
| "Astronauts carry the responsibility" | Self-service OK / Watch / Act status with next steps; works offline |

## MVP scope (what we demo Sunday)

- [ ] Crew roster → pick an astronaut
- [ ] Body map: upload a skin photo for a region
- [ ] AI analysis: find lesions, return structured JSON (location, size, color, ABCDE-style notes, risk level)
- [ ] Compare against the previous scan of the same region → "new" / "changed" / "stable"
- [ ] Vitals log (HR, BP, SpO₂) with baseline and trend chart
- [ ] Dashboard: one OK / Watch / Act status per astronaut, with reasons

**Stretch:** physical sensor device (KiCad + Onshape), mood/sleep check-in, mission timeline, exportable report for flight surgeons.

## Tech

- **App:** Vite + React + TypeScript in `app/`, runs entirely in the browser (works offline, like a spacecraft would need)
- **AI:** vision model behind one function (`app/src/lib/analysis.ts`). Mock analysis for now; swap in a real API call later
- **Data:** local storage / IndexedDB for the demo. Seeded mock crew and history so the demo has trends to show
- **NASA data (to research):** NASA Open Science Data Repository (OSDR / GeneLab), NASA Twins Study, Life Sciences Data Archive (LSDA), and radiation dose data, to set realistic baselines and story numbers

## Open questions

- Which NASA dataset do we cite or use directly? (judges look for NASA data use)
- Real model call vs. mock for the demo? (API key, offline story)
- Who owns what: app UI / AI analysis / vitals + charts / pitch + video?
- Is the hardware stretch realistic in 48 h?

> Not a medical device. HealthLens flags changes for review; it does not diagnose.
