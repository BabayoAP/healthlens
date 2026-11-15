# Past Winners — What Wins Space Apps

Compiled from past winning project pages, to steer HealthLens. Add new batches under **Sources** and update the patterns as more come in.

## TL;DR — do these for HealthLens

1. **Name specific NASA datasets, with IDs, and use at least one for real.** Every winner lists a "NASA Data" section, and the strongest ones use a dataset in the product (SpaceGenes+ cites *GLDS/OSD-288*; SkySense calls the *NASA POWER API*; PureFlow pulls live *DONKI* space-weather alerts). For us that means NASA OSDR/GeneLab, the Twins Study, LSDA, or radiation-dose data driving real numbers in the app.
2. **One sharp hook that sets you apart.** Each winner has a one-sentence "unlike X, we do Y". SpaceGenes+: "most tools treat stressors in isolation; we show them combined." PureFlow: "not if it can be built, but if the crew survives it." Ours: *"No dermatologist on Mars. HealthLens gives every crewmate a skin check-up that never forgets a spot."*
3. **Something live or interactive.** Every winner shipped a working, public link (vercel, framer, github pages, a custom domain). Judges click it. Deploy early.
4. **Show a worked example with real numbers.** Astro Sweepers walked one rocket body through before/after (lifetime >100 yrs → <25 yrs, risk 3.3×10⁻⁴ → 4.1×10⁻⁵). We should walk one astronaut through: "Day 97 scan → new 2 mm spot → Day 142 grew to 6.5 mm → **Act** → report sent."
5. **Tie it to who uses it and why it matters.** Each winner names users (researchers, drug developers, mission planners, operators, insurers) and the real-world stakes. Ours: the astronaut (self-check), the crew medical officer, flight surgeons on the ground, plus Earth spin-off (remote and rural skin-cancer screening).
6. **Be open about AI use.** There's a required AI section (2026: "Use of Super Intelligence", not shown to judges). Winners list each tool and what it did, then say "AI sped us up; logic, research and direction were ours; all output reviewed; no NASA logos or branding in AI output; AI images watermarked." Copy that structure.
7. **Fill every submission section well.** All winning pages follow the same template (below). A thin section looks weak next to them.

## The submission template (every winner uses it)

| Section | What winners put there |
| --- | --- |
| **Summary** | ~150–250 words: what we built → which challenge problem it solves → the unique angle → why it matters |
| **Project Demonstration** | Video link (YouTube / Drive) or slides (Canva) |
| **Project** | Live site or repo link |
| **Project Details** | What it does, how it works, benefits, intended impact, tools/stack, creativity, design considerations |
| **Use of AI** | Each tool + its purpose; human review statement; no NASA branding in AI output |
| **NASA Data** | Named datasets/APIs, ideally with IDs and dates |
| **Space Agency Partner & Other Data** | Other agencies (ESA, ISRO, USGS) + libraries/services used |

> **Verified 2026-11-14 against the official guides** (details in [SUBMISSION.md](../SUBMISSION.md)): demo is a video ≤30 s *or* ≤7 slides; judging criteria are **Impact, Creativity, Validity, Relevance, Presentation** (1–5 each). For 2026 the AI section is called "Use of Super Intelligence (SI)" and **is not shown to judges**, but watermarks and acknowledgements inside the project are.

## Patterns across winners

**Real data, named exactly.** Winners don't say "NASA data". They say "GLDS-288 RNA-Seq: Mouse Spleen in Spaceflight", "NASA POWER 10/4/23–10/4/25, surface shortwave irradiance, T2M…", "ORDEM 3.2", "DONKI". Weaker entries (AakashNet) only cite the NASA Image Library, and that's the one we should least copy.

**A formula or model of your own.** SpaceGenes+ has a synergy score (combined change > sum of single changes). Astro Sweepers has the ASRI index with stated weights (R 0.45, D 0.25, C 0.20, S 0.10) and says where they came from. Gaia-LEO has a cost optimizer. A named, explainable scoring rule reads as rigor. **For us:** a named HealthLens score built from ABCDE skin features + growth rate + vitals drift against each astronaut's own baseline, with the weights stated.

**Validation and false positives.** Resonant Exoplanets built its pitch around *reducing false positives*. Astro Sweepers stress-tested its results (different materials, perigees). **For us:** say how we avoid false alarms (own-baseline comparison, re-scan before escalating) and show that we checked the thresholds.

**Story + stakes up front.** PureFlow opens with "Would your habitat survive a solar storm… today?" Queñaris opens with spring flow dropping "from 14 L/s to 0 in days". One vivid number or question first, then the product.

**Beyond the prototype.** Several winners sketch a roadmap (Astro Sweepers' ML phases, Queñaris' 5,000 seedlings in December, SpaceGenes+ "in future, filter by organ system"). Keep it short and believable.

**Business/scale angle when it fits.** Strongest in LEO-commercialization winners (tiered pricing, break-even), less needed for us. A line on Earth use (telederm screening for remote areas) covers it.

**Polished, simple UI.** Framer, Figma, "glassy, minimal, accessible", exportable visuals, PDF reports. Two winners generate a **downloadable report**. For us: an exportable "flight surgeon report" PDF is cheap and matches the pattern.

**Stacks are ordinary.** React/Vite/TS, Python, Streamlit, FastAPI, Firebase/Supabase, Vercel, plus Gemini/Claude/ChatGPT APIs. No winner won on exotic tech. Lovable/Bolt/Cursor use was declared openly and didn't hurt.

## Most relevant winner: SpaceGenes+ (astronaut health)

- **Challenge:** Build a Space Biology Knowledge Engine (2025)
- **What:** dashboard showing how radiation + microgravity *together* change gene expression (TP53, ATM, GADD45A) using GeneLab **OSD-288** (mouse spleen in space)
- **Why it won (our read):** one real NASA dataset, one clear new idea (combined stressors), a direct link from molecules to astronaut risk, and named users
- **Steal for HealthLens:** cite GeneLab/OSDR radiation data to explain *why* skin and cancer risk goes up in space; consider DNA-damage genes (TP53/ATM) as background in our pitch

## Winner index (batch 1 — 2025 global winners)

| Project | Challenge | Core idea | NASA data | Stand-out move |
| --- | --- | --- | --- | --- |
| **SpaceGenes+** | Space Biology Knowledge Engine | Synergy dashboard for radiation × microgravity gene effects | GeneLab OSD-288 | Combined-stressor angle; links molecules to astronaut risk |
| **Resonant Exoplanets** | Hunting for Exoplanets with AI | Transit detection + exact-math chemistry to verify biosignatures | Kepler, TESS, JWST, Hubble (MAST) | Full pipeline; "fewer false positives" pitch; auto PDF reports |
| **SkySense** (Twisters) | Will It Rain On My Parade? | Hyper-local event weather risk + chatbot | NASA POWER API, Earthdata, Giovanni, GES DISC | Personal, actionable output (safest time window); calendar integration |
| **PureFlow** | Habitat Layout Creator | 3D habitat designer + life-support sim | DONKI (live space weather), NASA habitat paper | Live solar-storm alerts hit your design; strong narrative copy |
| **Astro Sweepers** | Commercializing LEO | Debris-compliance automation + ASRI risk index | ORDEM 3.2, LEGEND, DAS, NASA-STD-3001 | Worked before/after case study; stated weights; business model + policy |
| **AakashNet** (Photonics Odyssey) | Commercializing LEO | Sovereign Indian LEO broadband + phased-array terminal | NASA Image Library only | Regional/national framing; hardware sim (MATLAB, OpenEMS) |
| **Gaia-LEO** | Commercializing LEO | Optimizer for orbital vs ground data centers | NASA POWER (dated features) | Operations-research model; Streamlit scenario explorer |
| **Queñaris** | BloomWatch | Drone + satellite + AI reforestation planner | MODIS VIs, FIRMS, LAADS, Earthdata | Real field deployment (5,000 seedlings); local crisis numbers |

## Applied to HealthLens — checklist

- [ ] Pick 1–2 NASA datasets and **use** them (e.g. OSDR radiation/skin studies, Twins Study cardiovascular data for vitals baselines); list them with IDs
- [ ] Write the one-line hook + opening stat (skin cancer risk / radiation dose per mission)
- [ ] Name and define our score (e.g. "LensScore") with stated weights
- [ ] Build the worked example: one astronaut, two scans, escalation to **Act**
- [ ] Explain the false-alarm handling (own baseline, re-scan before escalating)
- [ ] Exportable flight-surgeon report (PDF)
- [ ] Deploy to a public URL early (Vercel)
- [ ] Draft the "Use of AI" section as we go (tools + purpose + review statement)
- [ ] Short roadmap: wearable sensor (KiCad/Onshape), Earth spin-off for remote screening

## Sources

- **Batch 1** — `past winners.docx` (2026-11-14): 8 project pages from the 2025 NASA Space Apps Challenge (SpaceGenes+, Resonant Exoplanets, SkySense, PureFlow, Astro Sweepers, AakashNet, Gaia-LEO, Queñaris). The pages don't say which award each won.
