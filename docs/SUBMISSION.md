# Submission Guide + Live Draft

How to write our Space Apps team page, and the current draft. **Keep the draft current as we build** (see CLAUDE.md). The Project tab is what judges score, so most of this file is about it.

> **Deadline:** click **Submit for Judging** before **Sun Nov 15, 2026, 11:59 p.m. PT**. Late = not judged. Save often on the site ("Save Progress"); turn the edit **Lock** on while editing so teammates don't overwrite you.

---

## Part 1: The rules (official, 2026)

From the official [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/) and [Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide):

- **Every judge scores 1–5 on five criteria:**

  | Criterion | What a 5 looks like (official wording, shortened) | How we hit it |
  | --- | --- | --- |
  | **Impact** | Significant problem, broad reach, "could change the world" | Astronaut safety on Moon/Mars + Earth spin-off for remote communities |
  | **Creativity** | Novel concept or meaningful improvement on existing ideas | AI skin profile that tracks every spot over time; flags slow drifts from *your own* baseline before any fixed threshold fires; comm-delay-aware emergency guides |
  | **Validity** | Scientifically sound, technically feasible, usable | Cited ranges, own-baseline logic, false-alarm handling, every value tagged measured / self-reported / simulated / estimated, working app |
  | **Relevance** | Fully addresses the challenge; **NASA data integral, not superficial** | Hit every challenge bullet (§ coverage table below); NASA data drives features |
  | **Presentation** | Clear, engaging story; judges use the demo **and** the full page | Strong hook, worked example, clean visuals |

  The guide explicitly says teams under-invest in **Presentation**, so give it equal time.
- **Most of the score comes from the Project page, not the demo.**
- **Demo:** video **≤30 seconds** *or* slide deck **≤7 slides** (incl. title + intro). Over the limit = **not eligible for global judging**. Host externally (YouTube/Drive/GitHub), public link, no login.
- **All links public, no login/permission.** Test each in a private window. Optional: request a FortiGuard web-filter classification for our site so school/corporate networks don't block it.
- **English** everywhere (video may be another language only with English subtitles).
- **At least one NASA data source or resource** is required for global awards.
- **No images/video/audio/likeness of anyone under 18.** Applies to skin photos and team shots in the demo.
- **AI ("Super Intelligence / SI") rules:** allowed as an accelerator, **not** to come up with the core idea. No NASA branding in AI output. AI images/video need a **visible watermark**; AI code, data or audio must be acknowledged in text/metadata. The SI answer itself **is not shown to judges**, but judges see watermarks and acknowledgements in the project.
- Images (JPG/PNG/GIF ≤10 MB) can be pasted straight into the Project page. **Use them**: past winners put diagrams and screenshots inline.
- Max 6 team members; everyone must be registered at the same local event and listed on the Members tab.
- Global awards we could realistically target: **Galactic Impact**, **Best Use of Data**, **Most Inspirational**, **Best Storytelling**, **Local Impact** (remote-care angle).

---

## Part 2: About tab (light touch)

The About tab is the team's identity, not the scored content. Keep it short and confident.

**Frame:**
1. One line: who we are + where (Irvine local event).
2. One line: what we chose and why it matters to us.
3. One line: the skills we brought (software, AI, hardware/CAD, design, storytelling).

**Draft:**
> We're **Hydrogen Temp**, a team at the NASA Space Apps Irvine local event. We picked *Create Health Monitoring Software for Astronauts* because on a Mars mission there's no doctor down the hall, and the crew has to catch problems in themselves. We combine software, AI, hardware design, and storytelling to build tools people actually use.

_(Check the exact About fields when we open the page; update this frame to match.)_

---

## Part 3: Project tab (the scored part)

Fields in order, as they appear on the form. For each: **what the form asks**, **what winners did**, **our frame**, **our draft**.

### 3.1 Project Name
- Winners: short, memorable, says the benefit (SkySense, PureFlow, SpaceGenes+). Several add a subtitle on the page title ("Astro Sweepers – AI-powered orbital debris compliance and risk intelligence").
- **Draft:** **HealthLens: an AI health check-up that never forgets, for crews with no doctor on board**

### 3.2 High-Level Project Summary
**Form asks:** What did you develop? How does it address the challenge? Why is it important?

**Winner pattern (all 8):** one paragraph, ~150–250 words, in this order:
1. *"We developed X, a [type of tool] that [does what] using [NASA data]."*
2. *How it meets the challenge*: echo the challenge's own words.
3. *The unique angle*: "Unlike tools that…, ours…" (SpaceGenes+: "most space omics tools treat stressors in isolation").
4. *Why it matters*: stakes in one or two concrete sentences, ideally with a number.

**How this draft is built (Nov 15 review):** the challenge has two halves, *help astronauts assess their own health* and *give guidance on what to do in an emergency*, so the summary gives both equal weight and uses the challenge's own words (assess, how to measure / why it matters / what to do, remind, adapt, HRP + OSDR, remote communities on Earth). Skin tracking is one of four parts, not the whole story. Following the winner pattern: what we built → how it meets the challenge → the unique angle ("unlike…") → why it matters, with a number.

**Draft (paste into the form; the form suggests 50–200 words):**
> We developed **HealthLens**, a visual tool that helps astronauts assess their own health and tells them what to do in an emergency, on missions with no doctor on board and up to 44 minutes for an answer from Earth. Crew members log vitals, blood sugar, sleep, mood and symptoms by hand or from devices modeled on space station hardware, run vision and reaction-time tests, and photograph each other's skin so an AI model can flag new or growing spots, an early cancer warning that matters more under space radiation. Every reading is compared with the astronaut's *own* baseline, so slow drifts are caught, and status shows green, amber or red on a clickable 3D body map. Because astronauts are not doctors, every measurement explains how to take it, why it matters in space and what to do when it looks wrong, and an Emergency button opens 15 guides drawn from NASA's Integrated Medical Model and adapted to weightlessness. It sends reminders and adapts to a station, spacecraft, rover or Moon or Mars base. Unlike dashboards that only raise alarms, HealthLens tells the crew what to do next, and could bring check-ups to remote communities on Earth.

_(196 words. Cut from the longer version to fit: the live DONKI space-weather feed, offline use, the flight-surgeon report and streaks. They are all in the Detailed Description, and DONKI is in the NASA Data field.)_

### 3.3 Link to Project Demo
**Rules:** ≤30 s video or ≤7 slides; public link.

**Decision (Nov 14): 7-slide deck** with short GIFs of the working app, total motion kept under 30 seconds. The full slide plan, rules and recording notes live in **[DEMO-PLAN.md](DEMO-PLAN.md)**; edit it there.

### 3.4 Link to Final Project
- Every winner linked a **live site** (vercel.app, framer, github.io, custom domain). Judges click it.
- **Live now: https://healthlens-one.vercel.app** (Vercel team `health-lens`, project `healthlens`, linked to this GitHub repo with root directory `app/`: every push to `main` redeploys by itself. Public, no login.) The earlier hand-deployed copy at https://app-tawny-mu-93.vercel.app is not updated by pushes; do not use it on the submission page.
- **Ours:** Vercel URL of `app/` (public, no login, demo data preloaded so it isn't empty). Link the GitHub repo inside the page too. **The repo is private now. Make it public, or link the live site only.**
- **Draft:** https://healthlens-one.vercel.app (demo crew preloaded; works on phone and desktop). Add the GitHub link only if the repo is made public.

### 3.5 Detailed Project Description (most important field)
**Form asks:** What exactly does it do? How does it work? What benefits? What do you hope to achieve? What tools/languages/hardware/software?

**What winners did:** these were long (PureFlow ~600 words, Astro Sweepers ~2,000) with **headings, bullets, inline images, and numbers**. The strongest ones:
- **Opened with a hook line.** PureFlow: "Would Your Habitat Survive a Solar Storm… Today?"
- **Had a named method with stated weights.** Astro Sweepers' ASRI: R 0.45, D 0.25, C 0.20, S 0.10, "weights emerged from sensitivity studies".
- **Walked through one worked example with before/after numbers.** Astro Sweepers: lifetime >100 yrs → <25 yrs.
- **Covered validation and false positives.** Resonant Exoplanets built its pitch on it.
- **Answered every form question under its own heading** (Queñaris literally used "What exactly does it do? / How does it work? / What benefits…").
- **Had a short, believable roadmap.**
- **Listed the full tool stack.**

**Our frame (use these headings):**
1. **Hook**: one line + one stat.
2. **What it does**: bullet per feature, each tied to a challenge requirement.
3. **How it works**: data flow: capture → AI analysis → personal baseline → status rules → guidance. Include a diagram image.
4. **The HealthLens score**: named scoring, weights stated, why those weights.
5. **Worked example**: one astronaut through two scans and the escalation, with screenshots.
6. **Emergency guidance**: its own section, since it is half of the challenge's first sentence.
7. **Built for space**: environment modes, comm delay, offline-first, body mass without gravity.
8. **Validity**: own-baseline comparison, re-measure-before-escalate, ranges cited, not-a-diagnosis.
9. **Benefits + impact**: crew, flight surgeons, Earth remote care.
10. **What we hope to achieve / next**: on-device model, wearable sensor, clinical validation.
11. **Tools & technologies**: full list.

**Draft (fill section by section as features land):**

> **No dermatologist on Mars.** A round trip to Mars alone exposes the crew to about 0.66 sievert of radiation, measured by the Curiosity rover's instrument on the way there (Zeitlin et al., Science, 2013), and a question to Earth can take up to 44 minutes to come back with an answer.
>
> **What it does**
> - Skin scans: crewmates photograph each other by body region; AI finds and tracks every lesion (new / changed / stable). The photo goes to a free open vision model through OpenRouter (NVIDIA Nemotron 3.5 Super VL, with Gemma 4 as backup), which returns each spot's position, size in mm, color and the A/B/C checks of the ABCDE rule as structured JSON; the app's own code then sets OK/Watch/Act from those answers and matches each spot to the previous scan of the same region in its own code to work out Evolution (E). No API key or no connection → a clearly labeled simulated result, so the app still works offline. _(status: built)_
> - Fifteen indicators tracked against each astronaut's **own baseline**: heart rate, blood pressure, SpO₂, breathing rate, temperature, fasting blood sugar (mg/dL, the example the challenge itself gives), body mass, sleep, mood, stress, fatigue, reaction time, near vision and the Amsler grid. Blood sugar is weekly because a Canadian Space Agency study found insulin resistance rose in flight (Hughson 2016). _(status: built)_
> - **Import from devices instead of typing:** one "Sync all" pulls a reading from each of the crew's health devices. Each device is modeled on real space hardware: a smart shirt and headband like the Canadian Space Agency's **Bio-Monitor** (heart rate, blood pressure, blood oxygen, breathing rate; on the space station since 2019), a sleep wristband like the **Actiwatch** from NASA's Sleep-Long study, a body mass device like the station's **SLAMMD** (a gravity-corrected scale on the Moon or Mars, not carried on the rover), a finger-prick blood analyzer like CSA's **Bio-Analyzer**, and an ear thermometer. No real hardware is connected: each sync continues the person's own recent values with small noise, is saved tagged "simulated" with the device name, and goes through the same rules as typed values. Real devices plug into the same path. _(status: built, simulated)_
> - **Check-in in under a minute:** enter what you measured, tap 1–5 for mood, stress and fatigue, and the app immediately shows each value against your baseline with a status and the reason. Obvious typos are caught before saving. _(status: built)_
> - **Tests the app runs itself:** a weekly **vision check** (a near-vision chart where the letter E gets smaller on every row and the crew member taps the way it points, then an Amsler grid for each eye) and a 30-second **reaction-time test** (tap when the circle turns green, 5 tries, middle value kept). Vision matters because of SANS: NASA says about 70% of space station astronauts have some swelling at the back of their eyes. Reaction time is a fatigue signal: it slows with sleep loss before the person feels tired. The screen is not a calibrated instrument, so both tests are judged only against the crew member's own baseline on the same device; any distortion on the Amsler grid goes straight to Act. Results are tagged "measured in app". _(status: built)_
> - **Symptom checklist:** a daily tap list grouped by body system (infection and immune, brain and balance, eyes, heart and breathing). Any symptom is Watch, the same symptom three days in a row is Act, and chest pain, trouble breathing or fainting is Act straight away. "No symptoms today" clears the flag. Symptoms feed the same status, insight cards, body map and flight-surgeon report as the measurements. _(status: built)_
> - Crew dashboard with green/amber/red status, the reason in plain words, and the next step. _(status: built)_
> - **Slow-drift detection:** flags a steady change over two weeks even while every value is still in the normal range (demo: resting heart rate 63 → 70 bpm). _(status: built)_
> - **False-alarm handling:** one odd reading asks for a re-measure; it only escalates when a second reading agrees or a hard safety limit is crossed. _(status: built)_
> - **Missed-check detection:** an overdue measurement becomes a warning ("no temperature reading in 5 days"). _(status: built)_
> - **Measurement guides for non-doctors:** for every measurement, how to take it, why it matters in space (tied to NASA's five spaceflight hazards), what is normal, what to do if it looks wrong, and when to get help. Guides for anything flagged open on their own, and the steps appear right after a flagged check-in. _(status: built; medical text needs source check)_
> - **Emergency mode:** a red button on every screen opens **15 guides in three priority groups**: life-threatening (not responding / CPR, low oxygen, chest pain, severe allergic reaction, smoke, fire or toxic air, severe bleeding), urgent (decompression sickness after a spacewalk, head injury, low blood sugar, fainting, solar radiation storm, eye injury, severe distress) and serious (burns, kidney stone pain). The list mirrors conditions in NASA's Integrated Medical Model, which models 100 spaceflight medical conditions. Guides the crew's own data points to (an urgent symptom or a reading past an Act limit in the last 24 hours) are suggested at the top, and a search box finds the rest. Each guide shows how to recognize it and what not to do, then one step per screen with a running timer, a step checklist and a "write down" field; at the end the timed event log is copied for the ground. Steps change with gravity: CPR in weightlessness follows the European space medicine guideline (strap to the restraint board, or brace and compress), blood forms floating drops, water does not run for cooling a burn. _(status: built, 15 guides, reference only)_
> - **Adapts to where the crew is:** space station, deep-space spacecraft, Moon base, pressurized lunar rover or Mars base (the rover has no mass device, shelters in the cabin if it cannot reach the base, and keeps working when the radio link drops behind terrain). This changes how body mass is measured (a scale does not work in microgravity), where to shelter from radiation, and the emergency advice: near Earth "call the flight surgeon now"; on Mars, with up to 22 minutes of signal delay each way, "send a report and keep going, the crew acts first". _(status: built)_
> - **Interactive body map:** a human figure where each part is clickable and colored by status. Selecting a part shows its body system (heart and circulation, brain and sleep, immune system, muscles and bones), the latest measurements against the astronaut's baseline, a trend chart, skin scans of that area, why spaceflight affects it, what to do, and when to contact the medical officer. It opens on the part that most needs attention. On the Body map the figure is a 3D anatomy model you can turn and zoom: drag to rotate, click a part to open it. A 2D view stays one click away (and is used automatically on devices without 3D graphics). _(status: built)_
> - **Two display themes:** a warm-gray dark theme for the cabin and a light daylight theme, switched in the sidebar; status colors stay green / amber / red in both. _(status: built)_
> - **Trends:** a chart for every indicator over the last 2 or 6 weeks, drawn against the astronaut's own baseline and the safety limits, so a slow drift is visible at a glance. Each tracked skin spot gets a size-over-time chart with the 6 mm line. Charts work by mouse, touch and keyboard, and each has a table view. _(status: built)_
> - **All-in-one dashboard:** one screen per crew member with no hunting: the whole crew's status in one sentence and a crew strip to switch person, vitals tiles with two-week sparklines, a body figure that labels each flagged part and opens it on the body map, checks done today, radiation dose and space-weather status, and a trend explorer: one large chart where any measure or skin spot can be picked, the time range changed (1 week to all), and the personal baseline and safety limits switched on or off, with latest / lowest / highest / change shown above it. _(status: built)_
> - **Honest data labels:** every value shows where it came from (entered, device, self-report, measured in app, simulated, estimated). Demo mode loads a simulated crew; judges can add their own readings on top. _(status: built)_
> - **Insights that say what to do:** every flag becomes a card with four parts: what we saw, why it matters in space, what to do, and when to get help. The "what we saw" line comes from the status rules, the rest from the measurement guide for that indicator, so the advice is never a black box. At the Act level the card adds how to reach the flight surgeon from where the crew is (live call near Earth; on Mars, send the report and start the steps without waiting). A skipped measurement gets the how-to-measure steps instead. _(status: built)_
> - **Report for the flight surgeon:** one button copies or downloads a plain-text summary of the findings, what the crew was told to do, and the latest readings against baseline, with simulated values still labeled. _(status: built)_
> - **Streaks:** the checks-due panel shows how many of the crew finished today's daily checks and each person's streak of days with every daily check done (Nakamura's broke when temperature checks were skipped). No ranking, nothing that shames. _(status: built)_
> - **Reminders:** the dashboard lists every check that is due or overdue for each crew member (daily vitals, sleep and mood; weekly body mass and skin scan), and each item opens the right screen for that person. Each astronaut also gets a full check schedule: how often, last done, next due. _(status: built; browser notifications not built)_
> - **Live NASA space weather:** the dashboard shows the last 30 days of NASA DONKI notifications (coronal mass ejections, radiation belt enhancements, geomagnetic storms, solar energetic particles) as a radiation watch with its own status, and links straight to the radiation storm guide. It caches for an hour and falls back to a saved real snapshot when offline. _(status: built)_
> - **Real anatomy in 3D, like an anatomy atlas:** the Body map figure is built from **BodyParts3D**, an open anatomy database of the Database Center for Life Science (Japan, CC BY 4.0): skin, a full skeleton (266 bones) and the main organs (brain, eyes, heart, aorta, lungs and airway, digestive organs, kidneys and bladder), simplified from about 2 million to about 230,000 triangles and compressed to a 680 KB file that works offline. Three layer switches (Skin, Organs, Skeleton) show or hide each layer; with skin over organs, the skin turns see-through. Each organ takes the status color of the body part it sits in (Vega's left arm is red on skin and bone), and clicking an organ, a bone or the skin opens that part. The skin is smoothed to a mannequin shape at the groin for a general audience. _(status: built)_
> - **Readable at a glance:** insight cards lead with what we saw and the first step, with a 3-week trend chart beside them; "why it matters" and "when to get help" fold away. Indicators are a grouped, filterable list (open a row for its trend and next steps), and each check gets a small calendar heatmap (one row per weekday, Monday to Sunday) with the next due day boxed (red when late). _(status: built)_
> - **Sources shown in the app:** every guide lists its sources, and a "Where the numbers come from" panel says, for each indicator, which limits are public reference values and which are HealthLens settings. _(status: built)_
>
> **How it works**: _(add diagram)_ Each indicator is checked in four steps: (1) absolute safety limits, (2) change against the astronaut's personal baseline (their first 7 readings), (3) a sustained trend over the last 14 days (least-squares line; flagged when the drift is steady, R² ≥ 0.6, and at least half the size of a baseline warning), (4) overdue measurements. The astronaut's status is the worst of all indicators plus the latest skin scan per body region. **Skin:** each spot in a new scan is paired with the nearest unused spot from the last scan of that body region (within 12% of the photo width); a pair keeps the same ID, so one spot can be followed for the whole mission. All data stays in the browser, so it works with no connection to Earth.
>
> **The HealthLens score**: **Skin spots** use the ABCDE rule dermatologists teach for self-checks. The model checks A (asymmetry), B (irregular border) and C (multiple colors) and estimates D (diameter); the app works out E (evolution) by comparing against the last scan. A spot is **Act** if two or more of A/B/C are present, it looks ulcerated or bleeding, or it measures over 6 mm; **Watch** if one is present; **OK** otherwise. A spot that is new since the last scan, grew by ≥1 mm or ≥20%, or gained a new color is raised to at least **Watch**. Sizes count as measured only when a reference sticker of known size is in the photo. A guessed size over 6 mm can raise a spot to Watch at most, and growth is compared only between two measured sizes (otherwise the app says "size not comparable"), so a guess from the model can never escalate a spot on its own. The app flags spots for a flight surgeon to review; a flagged spot can still be benign (like an atypical mole a dermatologist would refer), which is the intended behavior of a screening rule. _(Vitals: The vitals rules above are in `status.ts`; thresholds live in `indicators.ts` and still need source checks.)_
>
> **Worked example**: _(add screenshots)_ Demo crew of four, each with six weeks of simulated history: Vega has a spot on the left arm that grew from 4 mm to 6.5 mm in 45 days with an irregular border → **Act**. Osei's blood pressure crept from about 121 to 134 mmHg over two weeks → **Watch**. Nakamura's resting heart rate and sleep drifted slowly while every value still looked normal, and temperature checks were skipped → **Watch**. Lindqvist is healthy → **OK**.
>
> **Emergency guidance**: the challenge asks for "guidance on what to do in an emergency situation", so emergencies are a mode of their own, not an alert. A red **Emergency** button sits on every screen. It opens **15 guides in three priority groups**: *life-threatening* (not responding / CPR, low oxygen, chest pain, severe allergic reaction, smoke, fire or toxic air, severe bleeding), *urgent* (decompression sickness after a spacewalk, head injury, low blood sugar, fainting, solar radiation storm, eye injury, severe distress) and *serious* (burns, kidney stone pain). The list mirrors conditions in NASA's Integrated Medical Model. The app looks at the crew's last 24 hours: if someone ticked chest pain or a reading crossed an Act limit, the matching guide is suggested at the top. Each guide shows how to recognize the problem and what **not** to do, then one step per screen with a running timer, a checklist and a field to write down what happened. Steps change with where the crew is: CPR in weightlessness follows the European space-medicine guideline (strap the patient to the restraint board, or brace and compress), blood forms floating drops, water does not run to cool a burn, and the shelter step for a solar storm depends on the vehicle. Help from Earth changes too: near Earth the guide says "call the flight surgeon now"; on Mars it says "send the report and keep going, the crew acts first". At the end, the timed event log is copied as a report for the ground. Every guide lists its sources and is labeled reference only.
>
> **Benefits and impact**:
> - **For the crew:** one place to check yourself in a few minutes a day, with plain steps instead of medical jargon, and a clear rule for when a value needs attention.
> - **For the flight surgeon:** a short report of what was found, what the crew was told to do and the readings against baseline, ready for the next communication window instead of a stream of raw numbers.
> - **For mission planners:** the same app runs on a station, a spacecraft, a lunar rover and a Moon or Mars base, so crews train once and keep the same routine as missions go farther from Earth.
> - **On Earth:** the challenge notes these tools could help remote communities. HealthLens already works offline in a browser, needs no special hardware to start, and assumes the user is not a doctor. A rural clinic, a research station in Antarctica, a ship or a remote community could use the same check-ins, own-baseline rules and skin-spot tracking to spot changes early and send one clear report to a distant doctor.
>
> **What we hope to achieve next**:
> 1. **Real sensors:** connect a wearable (heart rate, blood oxygen, temperature) through the device-import path that already exists, starting with a simple KiCad / Onshape sensor design.
> 2. **On-device skin model:** run the spot-finding model on the tablet so skin scans work with no connection at all.
> 3. **Clinical check:** have doctors and dermatologists review the guides and thresholds, and test the skin rules on public images (ISIC) against dermatologist labels.
> 4. **Ground link:** send the flight-surgeon report automatically at the next communication window.
>
> **Tools & technologies**: React, TypeScript, Vite; OpenRouter API with free vision models (`nvidia/nemotron-3.5-super-vl:free`, falling back to `google/gemma-4-31b-it:free` and `openrouter/free`), structured JSON output; Zod for the response schema; charts in plain SVG (no chart library); Geist typeface (SIL Open Font License, bundled through Fontsource so it works offline) and Lucide icons; three.js for the 3D body figure (loaded only when the 3D view opens), with anatomy from BodyParts3D (CC BY 4.0) built with glTF Transform and meshoptimizer; Vitest for the rule tests; hosted on Vercel

### 3.6 Use of Super Intelligence (SI)
Not shown to judges, but required and must be honest. Winner pattern: list each tool + what it did + "the idea, research, logic and direction were ours; all output reviewed and tested; no NASA branding in AI output; AI images watermarked."

**AI-use log (append as we go):**
| Tool | Used for | Where |
| --- | --- | --- |
| Claude Code (Anthropic) | Project scaffolding, code generation and review, research summaries, document drafting | Whole repo |
| Claude Code (Anthropic) | Drafted the measurement-guide and emergency-step text from general first-aid practice and NASA hazard descriptions; team to check against sources | `app/src/lib/guides.ts`, `emergency.ts` |
| Claude Code (Anthropic) | Wrote the data layer, status rules, seeded demo data and tests, from the team's PRD | `app/src/lib/` |
| Free vision models via OpenRouter (`nvidia/nemotron-3.5-super-vl:free`, falling back to `google/gemma-4-31b-it:free` and `openrouter/free`) | Runs inside the app: finds skin spots in a photo and returns position, size, color and A/B/C checks as structured JSON. The OK/Watch/Act rules and new/changed/stable matching are our own code | `app/src/lib/analysis.ts` |
| Claude Code (Anthropic) | Wrote the holographic HUD theme, light / dark switch and the 3D body figure (three.js), from the team's direction; look only, no logic changed | `app/src/index.css`, `App.css`, `lib/theme.ts`, `components/BodyFigure3D.tsx` |
| Claude Code (Anthropic) | Wrote the skin-analysis integration, lesion matching and Skin screen changes, from the team's design | `app/src/lib/analysis.ts`, `app/src/pages/Skin.tsx` |
| Claude Code (Anthropic) | Checked limits and guide facts against public sources and wrote the source list; wrote the NASA DONKI space-weather feed | `app/src/lib/sources.ts`, `spaceWeather.ts` |
| Claude Code (Anthropic) | Wrote the insights, flight-surgeon report and reminders code and tests. The advice text is reused from the measurement guides, not newly generated | `app/src/lib/insights.ts`, `reminders.ts`, `pages/Insights.tsx`, `components/RemindersPanel.tsx` |
| Claude Code (Anthropic) | Wrote the vision check, reaction-time test and symptom checklist (screens, rules, tests) and drafted their guide text; facts checked against the cited NASA, AAO and journal sources | `app/src/pages/Tests.tsx`, `components/SymptomChecklist.tsx`, `lib/symptoms.ts`, `guides.ts` |
| Claude Code (Anthropic) | UI redesign from the team's inspiration board (Apple Health / Notion direction): sidebar app shell, design tokens, crew overview with a plain-language status headline, restyle of every screen; then the all-in-one dashboard (vitals tiles, body figure with callouts, filterable trend explorer) | `app/src/App.tsx`, `App.css`, `index.css`, `pages/Dashboard.tsx`, `components/TrendExplorer.tsx`, `BodyFigure.tsx` |
| Claude Code (Anthropic) | Searched for an openly licensed anatomy model (the team's references, a Sketchfab store model and Innerbody, are paid or not downloadable), wrote the BodyParts3D build script and the 3D anatomy viewer with layer switches, with tests; no AI-generated images | `app/scripts/build-body.mjs`, `components/BodyFigure3D.tsx`, `lib/anatomy.ts` |
| Claude Code (Anthropic) | Reviewed and rewrote the submission summary and added the emergency, impact and roadmap sections from the team's notes and past-winner research | `docs/SUBMISSION.md` |
| Claude Code (Anthropic) | Simulated device import (devices modeled on CSA Bio-Monitor / Bio-Analyzer, NASA Actiwatch and SLAMMD), breathing-rate and blood-sugar indicators, rover environment, 15 emergency guides with priorities and suggestions, streaks, Mon–Sun schedule labels, with tests. Drafted the emergency text from the cited MedlinePlus, CPR-guideline and NASA sources; team to review | `app/src/lib/devices.ts`, `emergency.ts`, `components/DeviceSync.tsx`, `pages/Emergency.tsx`, `pages/CheckIn.tsx` |
| Claude Code (Anthropic) | UI pass 5 from the team's feedback: warm dark palette, Bklit-style area charts and check heatmaps (look copied by hand, no Bklit code), seamless mannequin body figure (shared shape, distance-field mesh, 2D outline; the 3D mesh was later replaced by BodyParts3D anatomy), compact insight cards, indicator list, Check-in / Tests / Skin scan cleanup, with tests | `app/src/lib/bodyShape.ts`, `bodyMesh.ts`, `components/`, `pages/` |

**Draft:** _(write from the log at the end)_

### 3.7 NASA Data
Needs **specific names** ("GLDS-288 RNA-Seq: Mouse Spleen in Spaceflight"), not "NASA data". Relevance scores depend on data being **core to the product**, so for each entry say *how the app uses it*.

**Log (append as we go; mark "used in app" vs "cited"):**
| Source | ID / link | How HealthLens uses it | Status |
| --- | --- | --- | --- |
| NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information), NASA CCMC | ccmc.gsfc.nasa.gov/tools/DONKI · API `api.nasa.gov/DONKI/notifications` | **Live in the app.** Dashboard "Radiation watch": last 30 days of notifications, turned into a status and linked to the radiation storm guide. Saved real snapshot used offline | used in app |
| NASA Human Research Program: 5 Hazards of Human Spaceflight | nasa.gov/hrp/hazards | Every measurement guide and insight card is tied to one of the five hazards; basis for the "why it matters in space" text | used in app |
| NASA Human System Risks | nasa.gov/hhp/human-system-risks | "Why it matters in space" text for mood, stress and fatigue | used in app (cited) |
| NASA: Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS) | nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans | Reason for the weekly vision check; the "about 70% of space station astronauts have some swelling at the back of their eyes" figure in the vision guide and insight card | used in app |
| NASA OSDR: mouse skin after spaceflight, JAXA MHU-2 | OSD-238, OSD-239 · osdr.nasa.gov/bio/repo/data/studies/OSD-238 | Evidence that spaceflight changes skin-barrier and collagen genes; cited in the skin guide and skin insight card. IDs confirmed on OSDR | used in app (cited) |
| NASA OSDR: mouse skin after spaceflight, Rodent Research-5 | OSD-240, OSD-241 | same | used in app (cited) |
| NASA OSDR: mouse skin after spaceflight, Rodent Research-7 | OSD-254 | same | used in app (cited) |
| NASA Science: "How NASA Will Protect Astronauts From Space Radiation at the Moon" | science.nasa.gov/science-research/heliophysics/how-nasa-will-protect-astronauts-from-space-radiation-at-the-moon | Shelter step in the solar storm emergency guide (Orion storm-shelter procedure) | used in app |
| NASA-funded crew studies: body mass (Zwart 2014), sleep (Barger 2014), herpes virus reactivation (Rooney 2019), symptoms on ISS (Crucian 2016) | see Other References for links | The numbers in the guides: 2.8% average body mass loss, 6.1 h average sleep, 61% of ISS crew shedding herpes viruses, skin as the most reported complaint | used in app (cited) |
| NASA-STD-3001 Vol. 1 (Crew Health) | nasa.gov/reference/nasa-std-3001v1 | Background for monitoring and escalation wording; listed in the app's source file, not yet shown on a screen | cited |
| NASA Integrated Medical Model (IMM) | nasa.gov/nasa-integrated-medical-model-imm-overview | Choice of emergency guides: the IMM models 100 spaceflight medical conditions (e.g. decompression sickness, smoke inhalation, head injury, burns, renal stones, eye abrasion); each matching guide cites it | used in app (cited) |
| NASA Sleep-Long (Sleep-Wake Actigraphy and Light Exposure During Spaceflight-Long) | ntrs.nasa.gov/citations/20090014819 | Model for the simulated sleep wristband in device import | used in app (cited) |
| NASA Twins Study (results) | _TBD_ | Realistic trend scenarios for vitals/vision/cognition | idea, not used |

### 3.8 Space Agency Partner Data and Other References
List **everything**: code libraries, datasets, images, papers, even open-source. Partner-agency data is "highly encouraged": candidates are ESA, JAXA (the MHU-2 skin study is a JAXA mission), CSA, ISRO.

**Log (append as we go):**
| Resource | Type | Use |
| --- | --- | --- |
| JAXA Mouse Habitat Unit-2 (MHU-2) | Space Agency Partner data (via OSDR) | Skin study context |
| Canadian Space Agency, Bio-Monitor · asc-csa.gc.ca/eng/sciences/astroskin.asp | Space Agency Partner resource | Model for the simulated smart shirt (heart rate, blood pressure, SpO₂, breathing rate) in device import; breathing-rate guide |
| Canadian Space Agency, Bio-Analyzer · asc-csa.gc.ca/eng/iss/bio-analyzer.asp | Space Agency Partner resource | Model for the simulated finger-prick blood analyzer (blood sugar) |
| Hughson et al., Am J Physiol Heart Circ Physiol (2016), CSA Vascular study · doi.org/10.1152/ajpheart.00802.2015 | Paper (Space Agency Partner data) | Blood sugar guide: insulin resistance rose in flight in 8 astronauts |
| Hinkelbein et al., Scand J Trauma Resusc Emerg Med (2020), "CPR during spaceflight: a guideline for CPR in microgravity" (DGLRM / ESAM) · doi.org/10.1186/s13049-020-00793-y | Guideline | CPR steps in weightlessness |
| CDC, "Diabetes Testing" · cdc.gov/diabetes/diabetes-testing · NIDDK, "Low Blood Glucose (Hypoglycemia)" | Reference values | Blood sugar limits (99 / 100–125 / 126 mg/dL; below 70 low) and the low-sugar guide |
| MedlinePlus: Vital signs; CPR; Anaphylaxis; Bleeding; Burns; Head injury first aid; Eye emergencies; Fainting; Chest pain; Kidney Stones | Reference | Breathing-rate range (12–18 / min) and first-aid steps in the emergency guides |
| Communications Medicine (2024), "Transcriptomics analysis reveals molecular alterations underpinning spaceflight dermatology" | Paper | Skin evidence |
| Zeitlin et al., Science (2013), "Measurements of energetic particle radiation in transit to Mars on the Mars Science Laboratory" · doi.org/10.1126/science.1235989 | Paper (NASA MSL/RAD data) | Hook stat: about 0.66 Sv for a Mars round trip |
| Crucian et al., Int J Gen Med (2016), "Incidence of clinical symptoms during long-duration orbital spaceflight" · pmc.ncbi.nlm.nih.gov/articles/PMC5098747 | Paper | Skin problems as the most reported complaint on ISS (skin guide) |
| Barger et al., Lancet Neurology (2014), "Prevalence of sleep deficiency and use of hypnotic drugs in astronauts" · doi.org/10.1016/S1474-4422(14)70122-X | Paper | Sleep guide: 8.5 h scheduled, 6.1 h slept |
| Rooney et al., Frontiers in Microbiology (2019), "Herpes virus reactivation in astronauts during spaceflight" · doi.org/10.3389/fmicb.2019.00016 | Paper | Temperature guide: immune changes |
| Stavnichuk et al., npj Microgravity (2020), "A systematic review and meta-analysis of bone loss in space travelers" · doi.org/10.1038/s41526-020-0103-2 | Paper | Body mass guide: bone loss per month |
| Zwart et al., Aviat Space Environ Med (2014), "Body mass changes during long-duration spaceflight" · pubmed.ncbi.nlm.nih.gov/25197887 | Paper | Body mass limits and guide |
| American Heart Association, "Understanding Blood Pressure Readings" · heart.org/bplevels | Reference values | Blood pressure limits |
| MedlinePlus (US National Library of Medicine): Pulse, Pulse Oximetry, Body temperature norms, Fever | Reference values | Heart rate, SpO₂ and temperature limits |
| American Academy of Dermatology, "ABCDEs of melanoma" · aad.org | Reference | Skin-spot scoring (ABCDE rule) |
| Mader et al., Ophthalmology (2011), "Optic disc edema, globe flattening, choroidal folds, and hyperopic shifts observed in astronauts after long-duration space flight" · doi.org/10.1016/j.ophtha.2011.06.021 | Paper (NASA astronaut data) | Vision guide: about 60% of astronauts on long missions reported worse distant and near vision |
| Basner et al., Acta Astronautica (2011), "Validity and sensitivity of a brief psychomotor vigilance test (PVT-B) to total and partial sleep deprivation" · doi.org/10.1016/j.actaastro.2011.07.015 | Paper | Reaction-time test: this kind of test slows with sleep loss; a 3-minute version was validated for astronauts |
| American Academy of Ophthalmology, "Have AMD? Save Your Sight with an Amsler Grid" · aao.org/eye-health/tips-prevention/facts-about-amsler-grid-daily-vision-test | Reference | How to use the Amsler grid; any distortion is reported right away |
| React, Vite, TypeScript | Open-source code | App |
| Vitest | Open-source code | Tests for the status rules |
| Geist (Vercel, SIL Open Font License) via @fontsource-variable/geist | Open-source font | App typeface |
| Lucide icons (lucide-react, ISC license) | Open-source icons | Sidebar navigation icons |
| OpenRouter API (openrouter.ai) | AI model gateway | Calls free vision models from the browser for skin analysis |
| NVIDIA Nemotron 3.5 Super VL · Google Gemma 4 31B | Open-weight vision models | Skin-spot detection |
| Zod | Open-source code | Schema for the skin-analysis response |
| BodyParts3D 4.0, © The Database Center for Life Science, CC BY 4.0 · dbarchive.biosciencedbc.jp/en/bodyparts3d | Open anatomy dataset (3D meshes) | 3D body map: skin, skeleton and organs, simplified and merged by `app/scripts/build-body.mjs` into `app/public/models/body.glb`. Credit shown under the figure |
| glTF Transform, meshoptimizer (MIT) | Open-source code | Building and compressing the 3D anatomy model; three.js meshopt decoder loads it |
| Bklit UI (bklit.com), area chart and heatmap examples | Design reference | Look of the trend charts and check heatmaps; drawn in our own plain SVG/CSS, no Bklit code used |
| _(ISIC / HAM10000 if used)_ | Public dataset | Demo lesion images / model testing |

---

## Part 4: Challenge coverage (Relevance check)

Every bullet the challenge names, and where we answer it. Fill the "Where" column with screenshots/sections before submitting.

| Challenge asks for | HealthLens | Where |
| --- | --- | --- |
| Astronauts assess their own health | Device import or typed check-ins, in-app tests, symptom checklist + status | Check-in (device sync, typed entry, symptom checklist), Tests (vision check, reaction time), Dashboard and Vitals screens (built) |
| Guidance in an emergency | Emergency mode | Emergency button on every screen: 15 guides by priority, suggested from the crew's data, timed event log for the ground (built) |
| Explain how to measure, why it matters, what to do if abnormal | Guide cards per indicator + insight cards | Guides screen, after each flagged check-in, and the Insights screen: what we saw / why / what to do / when to get help (built) |
| Remind the crew | Due / overdue checks | "Checks due" panel on the Dashboard + check schedule heatmap per check (built; browser notifications not built) |
| Adapt to spacecraft / station / rover / Moon base | Environment modes | Location selector in the sidebar: station, spacecraft, Moon base, lunar rover, Mars base (built) |
| Use NASA HRP + OSDR | Hazard mapping + skin datasets + live DONKI space weather | Hazard tag on every guide and insight card; OSDR studies cited in the skin guide; "Radiation watch" on the Dashboard (built) |
| Any input incl. camera images; e.g. blood sugar in mg/dL | Skin photo scans, device import, typed values, taps | Skin page: camera/upload → AI spot map → comparison table; blood sugar in mg/dL on Check-in (built) |
| Clickable human figure (suggested) | 3D anatomy body map | Body map: real anatomy (skin, organs, skeleton layers), every part clickable and colored by status, shows its function and latest values; 2D figure on the Dashboard (built) |
| Gamification, dynamic charts, color coding (suggested) | Streaks, trend charts, green/amber/red | Color coding, Trends screen, daily streaks and "crew done today" (built) |
| Which measurements can be done in space? Why? When does a result need attention? What prevents a critical condition? | Guides answer all four per measurement; the device list says which space hardware takes each reading | Guides screen, device import "Modeled on" notes, insight cards (built) |
| Earth spin-off for remote communities | Impact section | Detailed Description → "Benefits and impact" (offline, no special hardware, non-doctor users, one report to a distant doctor) |

## Part 5: Final checklist (Sunday)
- [ ] All required fields filled, English
- [ ] Demo deck ≤7 slides, total GIF/clip time ≤30 s, public link tested in private window
- [ ] Final project link public, tested in private window, demo data preloaded
- [ ] Screenshots + diagram pasted into Detailed Description
- [ ] NASA Data names exact IDs and says how each is used
- [ ] No one under 18 visible/audible; AI visuals watermarked; no NASA logos
- [ ] All members on Members tab, all registered for Irvine
- [ ] Terms + "Confirm All Work is Original" boxes → **Submit for Judging** before 11:59 p.m. PT
