# HealthLens — Product Requirements Document

**NASA Space Apps 2026 · Team Hydrogen Temp · Challenge: Create Health Monitoring Software for Astronauts on Space Missions**

Status: v1 draft (2026-11-14). Team input + additions marked **[added]**. Full challenge text in the [appendix](#appendix-a--challenge-text).

---

## 1. Problem

On long missions astronauts are their own first responders. NASA's Human Research Program names five hazards of spaceflight, often shortened to **RIDGE**: **R**adiation, **I**solation & confinement, **D**istance from Earth, **G**ravity fields (altered), and hostile/closed **E**nvironments. They drive 30+ documented health risks: cancer, bone and muscle loss, cardiovascular change, vision problems, immune change and behavioral health.

The crew are not doctors. Help from the ground gets slower the farther they go (about 1.3 s each way to the Moon, up to ~20 min each way to Mars). They need a tool that tells them **how to measure, why it matters, and what to do when a value looks wrong.**

## 2. Product summary

HealthLens is a self-assessment tool for astronauts. It:

1. **Collects health indicators:** camera skin scans (crewmate-to-crewmate or self), vitals, body mass, mood/psych check-ins, strength, and more.
2. **Builds a personal baseline for each astronaut** and flags changes against *their own* normal, not just textbook ranges.
3. **Explains everything in plain language:** how to take each measurement, why it matters in space, and what to do when it's off.
4. **Guides action:** recommendations and step-by-step emergency guidance, plus a clear rule for when to call the flight surgeon.
5. **Keeps the crew on schedule** with reminders and light gamification.
6. **Shows trends over time** so patterns emerge.

**Headline feature:** AI skin mapping. Every mole, bump and blotch is found, labeled and tracked, so a new or changing spot is caught long before it turns dangerous. Radiation exposure raises cancer risk, which makes this matter more in space than on Earth.

**Hook:** *"No dermatologist on Mars. HealthLens gives every astronaut a skin check that never forgets a spot, and a medic's checklist for everything else."*

## 3. Users

| User | Needs |
| --- | --- |
| **Astronaut (primary)** | Fast check-ins, plain-language results, clear next step, reminders |
| **Crew medical officer** | Crew-wide status at a glance, drill-down per person, emergency guides |
| **Flight surgeon (ground)** | Exportable report with trends and flagged items, sent when comms allow |
| **Earth spin-off** [added] | Remote/rural clinics and people with limited care access: same skin-tracking and self-check flow |

## 4. Goals and success measures

| Goal | How we show it in the demo |
| --- | --- |
| Astronaut can assess their own health without medical training | Every indicator has a How / Why / If-abnormal card |
| Catch problems early | Worked example: new spot → grows → escalates to **Act** |
| Use real public data | Named NASA datasets drive baselines, risk explanations and test data ([§9](#9-data-sources)) |
| Works in different environments | Environment switch changes measurements, ranges and guidance ([§6](#6-environment-modes-added)) |
| Crew actually uses it | Reminders + streaks; dashboard shows what's due |

## 5. Features

Priority: **P0** = must exist for the demo, **P1** = should, **P2** = stretch / roadmap.

### 5.1 Skin scan + AI lesion mapping — P0
- Take or upload a photo per body region; capture by a crewmate or self (with a mirror/guide overlay).
- Model finds each lesion and returns location, size (mm, using a reference marker in frame), color, and ABCDE notes (Asymmetry, Border, Color, Diameter, Evolution).
- Each lesion gets a stable ID and is matched to earlier scans of the same region → **new / changed / stable**.
- Personal skin profile: all lesions over time, per astronaut.
- Capture guide [added]: lighting, distance, reference sticker, same pose each time. Consistent photos are what make comparison work.

### 5.2 Vitals and metabolic tracking — P0
Heart rate, blood pressure, SpO₂, temperature (manual entry; device import later). **P1:** blood glucose, hydration (urine color chart).

### 5.3 Body mass — P1
The team plan says "a scale". **[added]** A normal scale doesn't work in microgravity, so the method changes by environment:
- **Station / spacecraft:** mass-measuring device (the ISS uses SLAMMD, which measures mass from acceleration).
- **Moon / Mars base:** scale reading corrected for gravity (Moon ≈ 1/6 g, Mars ≈ 0.38 g).

The app explains this and asks for the right input per environment. Judges should like this detail.

### 5.4 Psychological & emotional check-in — P0
Short daily check-in: mood, stress, sleep hours/quality, energy, conflict with crew (1–5 sliders + optional note). Addresses the isolation/confinement hazard. **P1** [added]: a 1-minute reaction-time test as a fatigue/cognition signal (keyboard/tap).

### 5.5 Strength & fitness — P1
Biweekly/monthly tests: grip strength, push-ups / resistance-device max, exercise minutes. Addresses muscle and bone loss.

### 5.6 Vision check — P1 [added]
Spaceflight-associated neuro-ocular syndrome (SANS) affects many long-duration crew. Weekly on-screen near-vision chart + Amsler grid ("are any lines wavy?"). Cheap to build, directly NASA-relevant.

### 5.7 Radiation dose log — P1 [added]
Log dosimeter reading or estimate by mission/environment. Shows cumulative dose against the career limit, and links to the skin-cancer story. Solar storm alert → emergency "go to shelter" guide.

### 5.8 Dashboard — P0
- Crew view: each astronaut with an **OK / Watch / Act** status (green / amber / red) and the reason.
- Personal view: all indicators with status color, last value, trend arrow, and what's due.
- **Clickable body figure** [added — the challenge suggests it]: tap a body part to see its status, related indicators, function, and space risks. Skin scan regions live on the same figure.
- Functionality first; visual polish after the core works.

### 5.9 Actionable insights & recommendations — P0
Rules engine (not a black box) that turns data into advice, e.g.:
- "Systolic BP is 12 mmHg above your baseline for 3 days → re-measure seated after 5 min rest; reduce sodium; flag to flight surgeon if > 140."
- "Spot #3 on left arm grew 1.5 mm in 30 days → re-scan in 3 days; include in next flight-surgeon report."
- "Sleep < 6 h for 4 nights → sleep hygiene steps; check light schedule."

Every insight states **what we saw, why it matters in space, what to do, and when to escalate.**

### 5.10 Trends & history — P0
Charts per indicator over time with baseline band and threshold lines; skin timeline (side-by-side photos of a lesion over time). **P1:** pattern detection, e.g. "BP rises on days with < 6 h sleep".

### 5.11 Reminders — P0
Schedule per indicator (daily vitals + mood, weekly skin + vision, biweekly strength). Due/overdue list on the dashboard; browser notifications. Schedule changes by environment and mission phase.

### 5.12 Measurement guides — P0 [added; required by the challenge]
For **every** indicator, a card with:
- **How to measure** (steps, with pictures/animation where useful)
- **Why it matters in space** (which RIDGE hazard, which risk)
- **Normal range** and what counts as abnormal for *you*
- **If abnormal:** what to do now, what to monitor, when to call the flight surgeon

### 5.13 Emergency mode — P0 [added; the challenge asks for emergency guidance]
Big red button → step-by-step guides for: chest pain, trouble breathing / low SpO₂, fainting, severe allergic reaction, burns, eye injury, head injury, solar particle event (shelter). Each guide shows:
- immediate steps, one per screen
- what to measure and log while doing it
- **escalation adjusted for comm delay:** "Moon: call now. Mars: ~20 min delay — start step 3 before waiting for a reply."

Guides must be sourced from standard first-aid protocols and labeled as reference only.

### 5.14 Gamification — P1
Streaks for on-time check-ins, crew completion bar ("crew 5/6 done today"), badges for full-week streaks. Keep it light: health first, no ranking that shames anyone.

### 5.15 Flight-surgeon report — P1 [added; two past winners shipped PDF reports]
One-click PDF/printout: status summary, flagged items, trends, lesion photos. Queued to "send at next comm window".

### 5.16 Hardware sensor — P2
KiCad + Onshape wearable (HR/SpO₂/temp). Roadmap only unless someone has spare time.

## 6. Environment modes [added]

The challenge asks to adapt to spacecraft, station, rover and surface bases. One setting changes:

| | Spacecraft (transit) | Space station | Rover | Moon/Mars base |
| --- | --- | --- | --- | --- |
| Gravity | 0 g | 0 g | 1/6 or 0.38 g | 1/6 or 0.38 g |
| Body mass method | Mass device | Mass device (SLAMMD) | Skip | Corrected scale |
| Comm delay | Grows with distance | ~0 | Via base | Moon ~1.3 s / Mars 4–24 min |
| Emphasis | Radiation, bone/muscle, psych | Vision (SANS), CV, bone | Fatigue, injury, suit time | Dust exposure (skin/eyes/lungs), radiation, injury |
| Emergency guides | Limited supplies | Full medical kit | Get back to base first | Shelter procedures |

## 7. Health indicators (reference table)

Ranges are **placeholders for adults on Earth**. Personal baseline beats population range. Confirm each against a source before the demo.

| Indicator | Input | Cadence | Typical normal | Watch | Act / escalate | Hazard link |
| --- | --- | --- | --- | --- | --- | --- |
| Skin lesions | Camera | Weekly | Stable lesions | New spot, or ≥1 ABCDE flag | Growth, irregular border, multiple colors, bleeding | Radiation |
| Heart rate (rest) | Manual / device | Daily | 60–100 bpm (often lower in trained crew) | ±10 bpm vs baseline | <40 or >120 at rest, or with symptoms | Gravity, CV |
| Blood pressure | Cuff | Daily | <120/80 | ≥130/80 or +8 vs baseline | ≥140/90; ≥180/120 = emergency | Gravity, CV |
| SpO₂ | Pulse oximeter | Daily | 95–100 % | 92–94 % | <92 %; <88 % = emergency | Environment (CO₂, cabin air) |
| Temperature | Thermometer | Daily | 36.1–37.2 °C | 37.3–37.9 °C | ≥38 °C | Immune |
| Body mass | Mass device / scale | Weekly | Stable | −2 % in a month | −5 % | Nutrition, muscle |
| Mood / stress / sleep | Check-in | Daily | Stable scores, ≥7 h sleep | 3 low days | 7 low days or crisis answers | Isolation |
| Reaction time | Tap test | Weekly | Personal baseline | +15 % slower | +30 % | Isolation, sleep, radiation |
| Strength | Test | Biweekly | Personal baseline | −5 % | −10 % | Gravity (muscle/bone) |
| Vision | Chart + Amsler | Weekly | Unchanged | Blur at usual distance | Wavy lines / new blind spot | Gravity (SANS) |
| Radiation dose | Dosimeter | Daily | Within mission plan | Above plan | Solar event / near limit | Radiation |
| Hydration | Urine color chart | Daily | Pale | Dark | Dark + pain (kidney stone risk) | Gravity (bone → calcium) |

## 8. Status & scoring logic

- Each indicator → **OK / Watch / Act** from (a) personal baseline (first N readings), (b) absolute safety limits, (c) trend over the last N days.
- Astronaut status = worst indicator status, with all reasons listed.
- **Skin score** [added; past winners all had a named, explainable score]: per lesion, weighted ABCDE + growth rate; weights stated in the UI. Working name "LensScore".
- **False-alarm handling:** a single bad reading → re-measure prompt first; escalate only if it repeats or crosses a hard limit. Say this out loud in the pitch.

## 9. Data sources

Past winners named exact datasets and used them in the product. Our plan:

| Source | Use in HealthLens |
| --- | --- |
| **NASA Human Research Program** — hazards & risks (RIDGE) | Maps each indicator to a hazard; text in the "why it matters" cards |
| **NASA OSDR mouse-skin spaceflight RNA-seq: OSD-238, OSD-239 (JAXA MHU-2), OSD-240, OSD-241 (RR-5), OSD-254 (RR-7)** | Evidence that spaceflight changes skin (barrier function, collagen); cite in skin "why" card + pitch. Stretch: chart a few skin-barrier genes |
| **NASA Twins Study** (published results) | Vitals/CV, vision and cognition changes over a year in space; sets realistic trend scenarios for demo data |
| **NASA OSDR / GeneLab radiation studies** | Radiation → DNA damage / cancer story |
| **ISIC Archive / HAM10000** (public dermoscopy datasets) [added] | Test (or fine-tune) the lesion classifier; source for demo lesion images |
| **NASA DONKI** (space-weather API) [added] | Live solar-event alert → triggers the radiation shelter guide (PureFlow did this and won) |
| ESA / JAXA astronaut health resources | Second-agency data for the "Space Agency Partner" section |

Rule: **every number in the demo either comes from a cited source or is labeled "simulated"**.

## 10. Technical approach

- **App:** Vite + React + TypeScript in `app/`, browser-only, works offline (no internet in deep space). Data in IndexedDB/localStorage.
- **Skin AI:** one function (`app/src/lib/analysis.ts`). MVP = a vision-model API call returning structured JSON; fallback = mock for offline demo. Roadmap: on-device model trained on ISIC (no internet needed in space).
- **Rules engine:** `app/src/lib/status.ts`; thresholds in one config table matching §7.
- **Charts:** a light chart library (e.g. Recharts).
- **Deploy:** Vercel, public URL early.

## 11. Hackathon MVP cut (by Sunday)

1. Dashboard with crew + personal status, color coding — *partly built*
2. Skin scan → lesion table → new/changed/stable — *built with mock AI; needs real model call*
3. Vitals + mood check-in entry, saved locally
4. Measurement guide cards for 5 indicators (skin, HR, BP, SpO₂, mood)
5. Insights list with "what / why / do / escalate"
6. Trend chart for one vital + skin timeline for one lesion
7. Reminders list (due / overdue)
8. Emergency mode with 2 guides (low SpO₂, solar particle event)
9. Environment switch (station vs Moon base) changing at least the guides and the body-mass method
10. Seeded demo astronaut with the worked example

Everything else = roadmap slide.

## 12. Demo script (≈30 s or ≤7 slides — verify the rule)

1. Hook: "No dermatologist on Mars."
2. Dashboard: crew status; one astronaut amber/red.
3. Tap the astronaut → body figure → left arm → lesion timeline: Day 97 vs Day 142, spot grew → **Act**.
4. Insight card: what / why / do / escalate → export flight-surgeon report.
5. Switch to Moon base → guides and comm delay change.
6. Close: NASA data used + Earth spin-off (remote clinics).

## 13. Non-goals / risks

- **Not a diagnosis tool.** It flags changes for review. Shown on every screen.
- No real personal health data in the repo; demo data is synthetic.
- Medical content must be reviewed against sources; mark anything unverified.
- Risk: AI lesion detection is unreliable on random photos → controlled demo images + capture guide.

## 14. Open questions

- Which vision model / API, and is there an offline fallback for the demo?
- Who owns what (UI, skin AI, rules + guides, data + pitch/video)?
- Do we use Twins Study numbers directly or only cite them?
- Is the hardware stretch dropped?

---

## Appendix A — Challenge text

**Create software that helps astronauts assess their own health and gives guidance on what to do in an emergency situation.** Think outside the box. Remember that astronauts are not doctors. Your tool should explain how to take each measurement, why it matters, and what to do when a value does not look normal. Remind the crew to take measurements. Adapt it to different environments like a spacecraft, a space station, or a base on the surface of the Moon. Use NASA's Human Research Program to understand the risks of being in space for the human body and the health indicators that are relevant in this context. You can also use NASA's Open Science Data Repository, which gathers real spaceflight biology data, for inspiration and to test your ideas. The solutions could also inspire health care tools on Earth for remote communities or places with limited access to health services.

**Objectives.** Create a visual tool that helps astronauts assess their own health during space missions and provides guidance on treatments and health improvements. Data can come from any input (keyboard text, mouse clicks, camera images), as long as it represents a health indicator (e.g. blood sugar in mg/dL, ultrasound images). Use NASA HRP resources and other agencies' public resources to understand how spaceflight hazards affect health and which indicators support a quick assessment. Questions to consider: Which measurements can be performed in space? Why is an exam needed? How do spaceflight hazards affect these indicators? When does a result warrant attention from the crew or flight surgeons? What actions can prevent a critical condition? UI design matters: consider animations and interactivity, e.g. a human figure where each body part is clickable and shows its function and health status.

**Potential considerations (optional).** Different environments (spacecraft, station, rover, planetary/lunar base); prompting astronauts to take measurements as part of the mission routine; gamification; dynamic charts over time; color coding for at-a-glance status. Don't assume astronauts know how to assess their health: give simple instructions and explanations covering measurements, indicators, and risks.

## Appendix B — Original team notes

Visual data from astronaut to astronaut or self. Photos of each other's bodies stored in logs; each log runs through a model that identifies and categorizes each mole, bump and blotch and builds a personal profile. New imperfections are noticed, helping detect cancerous/malignant tumors early. Add heart rate, blood pressure and other metabolic tests. Body weight via a scale. User-input emotional/psychological state; strength metrics (biweekly or monthly). Use public datasets. All-encompassing dashboard (functionality first, UI later). Reminders. Actionable insights/recommendations. View past health trends and patterns over time.
