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

**Draft (update as features land):**
> We developed **HealthLens**, a self-assessment health app for astronauts on long missions, where the crew carries much of the responsibility for spotting health changes in themselves. Crewmates photograph each other's skin, and an AI model maps every mole, bump and blotch into a personal skin profile that flags any new or changing spot, catching potential skin cancer early, a risk that space radiation increases. HealthLens adds vitals, body mass, mood, sleep, strength and vision checks, compares every reading against the astronaut's *own* baseline, and turns the result into a simple green/amber/red status. Because astronauts are not doctors, every measurement comes with plain-language steps: how to take it, why it matters in space, and what to do when it looks wrong, including emergency guides that adjust for the communication delay to Earth. Reminders and streaks keep the crew on routine, and the app adapts to a spacecraft, a space station or a lunar base. Built on NASA Human Research Program risk research and NASA OSDR spaceflight skin data, HealthLens helps crews act before problems become emergencies, and the same tools can bring check-ups to remote communities on Earth.

### 3.3 Link to Project Demo
**Rules:** ≤30 s video or ≤7 slides; public link.

**Decision (Nov 14): 7-slide deck** with short GIFs of the working app, total motion kept under 30 seconds. The full slide plan, rules and recording notes live in **[DEMO-PLAN.md](DEMO-PLAN.md)**; edit it there.

### 3.4 Link to Final Project
- Every winner linked a **live site** (vercel.app, framer, github.io, custom domain). Judges click it.
- **Live now: https://healthlens-one.vercel.app** (Vercel team `health-lens`, project `healthlens`, linked to this GitHub repo with root directory `app/`: every push to `main` redeploys by itself. Public, no login.) The earlier hand-deployed copy at https://app-tawny-mu-93.vercel.app is not updated by pushes; do not use it on the submission page.
- **Ours:** Vercel URL of `app/` (public, no login, demo data preloaded so it isn't empty). Link the GitHub repo inside the page too. **The repo is private now. Make it public, or link the live site only.**
- Draft: _TBD after deploy_

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
6. **Built for space**: environment modes, comm delay, offline-first, body mass without gravity.
7. **Validity**: own-baseline comparison, re-measure-before-escalate, ranges cited, not-a-diagnosis.
8. **Benefits + impact**: crew, flight surgeons, Earth remote care.
9. **What we hope to achieve / next**: on-device model, wearable sensor, clinical validation.
10. **Tools & technologies**: full list.

**Draft (fill section by section as features land):**

> **No dermatologist on Mars.** A round trip to Mars alone exposes the crew to about 0.66 sievert of radiation, measured by the Curiosity rover's instrument on the way there (Zeitlin et al., Science, 2013), and a question to Earth can take up to 44 minutes to come back with an answer.
>
> **What it does**
> - Skin scans: crewmates photograph each other by body region; AI finds and tracks every lesion (new / changed / stable). The photo goes to a free open vision model through OpenRouter (NVIDIA Nemotron 3.5 Super VL, with Gemma 4 as backup), which returns each spot's position, size in mm, color and the A/B/C checks of the ABCDE rule as structured JSON; the app's own code then sets OK/Watch/Act from those answers and matches each spot to the previous scan of the same region in its own code to work out Evolution (E). No API key or no connection → a clearly labeled simulated result, so the app still works offline. _(status: built)_
> - Thirteen indicators tracked against each astronaut's **own baseline**: heart rate, blood pressure, SpO₂, temperature, body mass, sleep, mood, stress, fatigue, reaction time, near vision and the Amsler grid. _(status: built)_
> - **Check-in in under a minute:** enter what you measured, tap 1–5 for mood, stress and fatigue, and the app immediately shows each value against your baseline with a status and the reason. Obvious typos are caught before saving. _(status: built)_
> - **Tests the app runs itself:** a weekly **vision check** (a near-vision chart where the letter E gets smaller on every row and the crew member taps the way it points, then an Amsler grid for each eye) and a 30-second **reaction-time test** (tap when the circle turns green, 5 tries, middle value kept). Vision matters because of SANS: NASA says about 70% of space station astronauts have some swelling at the back of their eyes. Reaction time is a fatigue signal: it slows with sleep loss before the person feels tired. The screen is not a calibrated instrument, so both tests are judged only against the crew member's own baseline on the same device; any distortion on the Amsler grid goes straight to Act. Results are tagged "measured in app". _(status: built)_
> - **Symptom checklist:** a daily tap list grouped by body system (infection and immune, brain and balance, eyes, heart and breathing). Any symptom is Watch, the same symptom three days in a row is Act, and chest pain, trouble breathing or fainting is Act straight away. "No symptoms today" clears the flag. Symptoms feed the same status, insight cards, body map and flight-surgeon report as the measurements. _(status: built)_
> - Crew dashboard with green/amber/red status, the reason in plain words, and the next step. _(status: built)_
> - **Slow-drift detection:** flags a steady change over two weeks even while every value is still in the normal range (demo: resting heart rate 63 → 70 bpm). _(status: built)_
> - **False-alarm handling:** one odd reading asks for a re-measure; it only escalates when a second reading agrees or a hard safety limit is crossed. _(status: built)_
> - **Missed-check detection:** an overdue measurement becomes a warning ("no temperature reading in 5 days"). _(status: built)_
> - **Measurement guides for non-doctors:** for every measurement, how to take it, why it matters in space (tied to NASA's five spaceflight hazards), what is normal, what to do if it looks wrong, and when to get help. Guides for anything flagged open on their own, and the steps appear right after a flagged check-in. _(status: built; medical text needs source check)_
> - **Emergency mode:** a red button on every screen opens step-by-step guides (low oxygen, solar radiation storm), one step per screen, with what to write down. _(status: built, 2 guides)_
> - **Adapts to where the crew is:** space station, deep-space spacecraft, Moon base or Mars base. This changes how body mass is measured (a scale does not work in microgravity), where to shelter from radiation, and the emergency advice: near Earth "call the flight surgeon now"; on Mars, with up to 24 minutes of signal delay each way, "send a report and keep going, the crew acts first". _(status: built)_
> - **Interactive body map:** a human figure where each part is clickable and colored by status. Selecting a part shows its body system (heart and circulation, brain and sleep, immune system, muscles and bones), the latest measurements against the astronaut's baseline, a trend chart, skin scans of that area, why spaceflight affects it, what to do, and when to contact the medical officer. It opens on the part that most needs attention. _(status: built)_
> - **Trends:** a chart for every indicator over the last 2 or 6 weeks, drawn against the astronaut's own baseline and the safety limits, so a slow drift is visible at a glance. Each tracked skin spot gets a size-over-time chart with the 6 mm line. Charts work by mouse, touch and keyboard, and each has a table view. _(status: built)_
> - **Honest data labels:** every value shows where it came from (entered, device, self-report, measured in app, simulated, estimated). Demo mode loads a simulated crew; judges can add their own readings on top. _(status: built)_
> - **Insights that say what to do:** every flag becomes a card with four parts: what we saw, why it matters in space, what to do, and when to get help. The "what we saw" line comes from the status rules, the rest from the measurement guide for that indicator, so the advice is never a black box. At the Act level the card adds how to reach the flight surgeon from where the crew is (live call near Earth; on Mars, send the report and start the steps without waiting). A skipped measurement gets the how-to-measure steps instead. _(status: built)_
> - **Report for the flight surgeon:** one button copies or downloads a plain-text summary of the findings, what the crew was told to do, and the latest readings against baseline, with simulated values still labeled. _(status: built)_
> - **Reminders:** the dashboard lists every check that is due or overdue for each crew member (daily vitals, sleep and mood; weekly body mass and skin scan), and each item opens the right screen for that person. Each astronaut also gets a full check schedule: how often, last done, next due. _(status: built; browser notifications not built)_
> - **Live NASA space weather:** the dashboard shows the last 30 days of NASA DONKI notifications (coronal mass ejections, radiation belt enhancements, geomagnetic storms, solar energetic particles) as a radiation watch with its own status, and links straight to the radiation storm guide. It caches for an hour and falls back to a saved real snapshot when offline. _(status: built)_
> - **Sources shown in the app:** every guide lists its sources, and a "Where the numbers come from" panel says, for each indicator, which limits are public reference values and which are HealthLens settings. _(status: built)_
>
> **How it works**: _(add diagram)_ Each indicator is checked in four steps: (1) absolute safety limits, (2) change against the astronaut's personal baseline (their first 7 readings), (3) a sustained trend over the last 14 days (least-squares line; flagged when the drift is steady, R² ≥ 0.6, and at least half the size of a baseline warning), (4) overdue measurements. The astronaut's status is the worst of all indicators plus the latest skin scan per body region. **Skin:** each spot in a new scan is paired with the nearest unused spot from the last scan of that body region (within 12% of the photo width); a pair keeps the same ID, so one spot can be followed for the whole mission. All data stays in the browser, so it works with no connection to Earth.
>
> **The HealthLens score**: **Skin spots** use the ABCDE rule dermatologists teach for self-checks. The model checks A (asymmetry), B (irregular border) and C (multiple colors) and estimates D (diameter); the app works out E (evolution) by comparing against the last scan. A spot is **Act** if two or more of A/B/C are present, it looks ulcerated or bleeding, or it measures over 6 mm; **Watch** if one is present; **OK** otherwise. A spot that is new since the last scan, grew by ≥1 mm or ≥20%, or gained a new color is raised to at least **Watch**. Sizes count as measured only when a reference sticker of known size is in the photo. A guessed size over 6 mm can raise a spot to Watch at most, and growth is compared only between two measured sizes (otherwise the app says "size not comparable"), so a guess from the model can never escalate a spot on its own. The app flags spots for a flight surgeon to review; a flagged spot can still be benign (like an atypical mole a dermatologist would refer), which is the intended behavior of a screening rule. _(Vitals: The vitals rules above are in `status.ts`; thresholds live in `indicators.ts` and still need source checks.)_
>
> **Worked example**: _(add screenshots)_ Demo crew of four, each with six weeks of simulated history: Vega has a spot on the left arm that grew from 4 mm to 6.5 mm in 45 days with an irregular border → **Act**. Osei's blood pressure crept from about 121 to 134 mmHg over two weeks → **Watch**. Nakamura's resting heart rate and sleep drifted slowly while every value still looked normal, and temperature checks were skipped → **Watch**. Lindqvist is healthy → **OK**.
>
> **Tools & technologies**: React, TypeScript, Vite; OpenRouter API with free vision models (`nvidia/nemotron-3.5-super-vl:free`, falling back to `google/gemma-4-31b-it:free` and `openrouter/free`), structured JSON output; Zod for the response schema; charts in plain SVG (no chart library); hosted on Vercel

### 3.6 Use of Super Intelligence (SI)
Not shown to judges, but required and must be honest. Winner pattern: list each tool + what it did + "the idea, research, logic and direction were ours; all output reviewed and tested; no NASA branding in AI output; AI images watermarked."

**AI-use log (append as we go):**
| Tool | Used for | Where |
| --- | --- | --- |
| Claude Code (Anthropic) | Project scaffolding, code generation and review, research summaries, document drafting | Whole repo |
| Claude Code (Anthropic) | Drafted the measurement-guide and emergency-step text from general first-aid practice and NASA hazard descriptions; team to check against sources | `app/src/lib/guides.ts`, `emergency.ts` |
| Claude Code (Anthropic) | Wrote the data layer, status rules, seeded demo data and tests, from the team's PRD | `app/src/lib/` |
| Free vision models via OpenRouter (`nvidia/nemotron-3.5-super-vl:free`, falling back to `google/gemma-4-31b-it:free` and `openrouter/free`) | Runs inside the app: finds skin spots in a photo and returns position, size, color and A/B/C checks as structured JSON. The OK/Watch/Act rules and new/changed/stable matching are our own code | `app/src/lib/analysis.ts` |
| Claude Code (Anthropic) | Wrote the skin-analysis integration, lesion matching and Skin screen changes, from the team's design | `app/src/lib/analysis.ts`, `app/src/pages/Skin.tsx` |
| Claude Code (Anthropic) | Checked limits and guide facts against public sources and wrote the source list; wrote the NASA DONKI space-weather feed | `app/src/lib/sources.ts`, `spaceWeather.ts` |
| Claude Code (Anthropic) | Wrote the insights, flight-surgeon report and reminders code and tests. The advice text is reused from the measurement guides, not newly generated | `app/src/lib/insights.ts`, `reminders.ts`, `pages/Insights.tsx`, `components/RemindersPanel.tsx` |
| Claude Code (Anthropic) | Wrote the vision check, reaction-time test and symptom checklist (screens, rules, tests) and drafted their guide text; facts checked against the cited NASA, AAO and journal sources | `app/src/pages/Tests.tsx`, `components/SymptomChecklist.tsx`, `lib/symptoms.ts`, `guides.ts` |

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
| NASA Twins Study (results) | _TBD_ | Realistic trend scenarios for vitals/vision/cognition | idea, not used |

### 3.8 Space Agency Partner Data and Other References
List **everything**: code libraries, datasets, images, papers, even open-source. Partner-agency data is "highly encouraged": candidates are ESA, JAXA (the MHU-2 skin study is a JAXA mission), CSA, ISRO.

**Log (append as we go):**
| Resource | Type | Use |
| --- | --- | --- |
| JAXA Mouse Habitat Unit-2 (MHU-2) | Space Agency Partner data (via OSDR) | Skin study context |
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
| OpenRouter API (openrouter.ai) | AI model gateway | Calls free vision models from the browser for skin analysis |
| NVIDIA Nemotron 3.5 Super VL · Google Gemma 4 31B | Open-weight vision models | Skin-spot detection |
| Zod | Open-source code | Schema for the skin-analysis response |
| _(ISIC / HAM10000 if used)_ | Public dataset | Demo lesion images / model testing |

---

## Part 4: Challenge coverage (Relevance check)

Every bullet the challenge names, and where we answer it. Fill the "Where" column with screenshots/sections before submitting.

| Challenge asks for | HealthLens | Where |
| --- | --- | --- |
| Astronauts assess their own health | Self check-ins, in-app tests, symptom checklist + status | Check-in (with symptom checklist), Tests (vision check, reaction time), Dashboard and Vitals screens (built) |
| Guidance in an emergency | Emergency mode | Emergency button on every screen (built, 2 guides) |
| Explain how to measure, why it matters, what to do if abnormal | Guide cards per indicator + insight cards | Guides screen, after each flagged check-in, and the Insights screen: what we saw / why / what to do / when to get help (built) |
| Remind the crew | Due / overdue checks | "Checks due" panel on the Dashboard + check schedule on the Insights screen (built; browser notifications and streaks not built) |
| Adapt to spacecraft / station / Moon base | Environment modes | Environment selector in the header: station, spacecraft, Moon, Mars (built) |
| Use NASA HRP + OSDR | Hazard mapping + skin datasets + live DONKI space weather | Hazard tag on every guide and insight card; OSDR studies cited in the skin guide; "Radiation watch" on the Dashboard (built) |
| Any input incl. camera images | Skin photo scans | Skin page: camera/upload → AI spot map → comparison table |
| Clickable human figure (suggested) | Body figure | Body map screen; opens from each crew card (built) |
| Gamification, dynamic charts, color coding (suggested) | Streaks, trend charts, green/amber/red | Color coding + Trends screen built; streaks pending |
| Earth spin-off for remote communities | Impact section | |

## Part 5: Final checklist (Sunday)
- [ ] All required fields filled, English
- [ ] Demo deck ≤7 slides, total GIF/clip time ≤30 s, public link tested in private window
- [ ] Final project link public, tested in private window, demo data preloaded
- [ ] Screenshots + diagram pasted into Detailed Description
- [ ] NASA Data names exact IDs and says how each is used
- [ ] No one under 18 visible/audible; AI visuals watermarked; no NASA logos
- [ ] All members on Members tab, all registered for Irvine
- [ ] Terms + "Confirm All Work is Original" boxes → **Submit for Judging** before 11:59 p.m. PT
