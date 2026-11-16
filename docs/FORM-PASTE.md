# Space Apps Project form: paste kit

Clean text for each field of the Project tab, in form order. Built from SUBMISSION.md (Nov 15); internal notes removed. Every link is a full URL, one per "Add New Link" row.

---

## Project Name

HealthLens

## Summary (196 words, limit 1500 characters)

We developed HealthLens, a visual tool that helps astronauts assess their own health and tells them what to do in an emergency, on missions with no doctor on board and up to 44 minutes for an answer from Earth. Crew members log vitals, blood sugar, sleep, mood and symptoms by hand or from devices modeled on space station hardware, run vision and reaction-time tests, and photograph each other's skin so an AI model can flag new or growing spots, an early cancer warning that matters more under space radiation. Every reading is compared with the astronaut's own baseline, so slow drifts are caught, and status shows green, amber or red on a clickable 3D body map. Because astronauts are not doctors, every measurement explains how to take it, why it matters in space and what to do when it looks wrong, and an Emergency button opens 15 guides drawn from NASA's Integrated Medical Model and adapted to weightlessness. It sends reminders and adapts to a station, spacecraft, rover or Moon or Mars base. Unlike dashboards that only raise alarms, HealthLens tells the crew what to do next, and could bring check-ups to remote communities on Earth.

## Project Demonstration

_(public link to the 7-slide deck: Google Slides, "Anyone with the link can view". Test it in a private window.)_

## Project

https://healthlens-one.vercel.app

---

## Project Details

**Halfway to Mars, a crewmate feels a sharp pain in the chest and collapses. What do you do?** That is how the challenge video opens. On a Mars mission there is no doctor down the hall, a question to Earth can take up to 44 minutes to answer, and a round trip alone exposes the crew to about 0.66 sievert of radiation (Zeitlin et al., Science, 2013). HealthLens is the crew's own medic: it helps each astronaut check their health in a few minutes a day, and tells them exactly what to do when something is wrong.

**What it does**

- **Check-ins in under a minute.** Fifteen health indicators: heart rate, blood pressure, blood oxygen, breathing rate, temperature, fasting blood sugar (mg/dL), body mass, sleep, mood, stress, fatigue, reaction time, near vision and the Amsler grid. Values can be typed, or imported with one "Sync all" from devices modeled on real space hardware: a smart shirt like the Canadian Space Agency's Bio-Monitor, a sleep wristband like the Actiwatch from NASA's Sleep-Long study, a body mass device like the station's SLAMMD, a finger-prick analyzer like CSA's Bio-Analyzer, and an ear thermometer. (No hardware is connected in this prototype; imported values are labeled simulated.)
- **Tests the app runs itself.** A weekly vision check (a shrinking letter-E chart and an Amsler grid for each eye) because about 70% of space station astronauts show swelling at the back of the eye (NASA, SANS), and a reaction-time test, which slows with sleep loss before you feel tired.
- **Skin check that never forgets a spot.** Crewmates photograph each other by body region; an AI vision model finds each spot and its size, color and shape, and HealthLens matches it to the last scan to see if it is new or growing (the ABCDE rule dermatologists teach). Radiation raises skin-cancer risk, and skin problems are the most reported complaint on the space station.
- **Symptom checklist.** A daily tap list by body system. Chest pain, trouble breathing or fainting raises the alarm at once.
- **Compared with your own normal.** Every reading is checked against the astronaut's personal baseline, not just textbook ranges, so a slow drift is caught while every value still looks "normal" (demo: resting heart rate 63 → 70 bpm over two weeks).
- **Guidance for non-doctors.** Every measurement has a guide: how to take it, why it matters in space (tied to NASA's five hazards of human spaceflight), what is normal, what to do if it looks wrong, and when to call the flight surgeon. Flags become insight cards with the same four parts.
- **Emergency mode.** A red button on every screen opens 15 guides in three priority groups: life-threatening (not responding / CPR, low oxygen, chest pain, severe allergic reaction, smoke, fire or toxic air, severe bleeding), urgent (decompression sickness after a spacewalk, head injury, low blood sugar, fainting, solar radiation storm, eye injury, severe distress) and serious (burns, kidney stones), chosen from conditions in NASA's Integrated Medical Model. If someone ticked chest pain or a reading crossed a danger limit, the matching guide is suggested first. Each guide shows how to recognize it and what not to do, then one step per screen with a timer and a log. Steps change with gravity: CPR in weightlessness follows the European space-medicine guideline (strap to the restraint board, or brace and compress), blood forms floating drops, water does not run to cool a burn. At the end, the timed log is copied as a report for the ground.
- **Location comes first.** A mission bar on every screen shows where the crew is (space station, spacecraft to Mars, Moon base, lunar rover, Mars base), the gravity, the signal delay to Earth and whether help is live or delayed. Location changes how body mass is measured, where to shelter from radiation, which checks and emergencies matter most, and the advice: near Earth "call the flight surgeon now"; on the way to Mars "send the report and keep going, the crew acts first".
- **3D body map.** A real anatomy model, female or male to match each crew member (from the HuBMAP Human Reference Atlas and BodyParts3D, both open data), with skin, organ and skeleton layers. Every part is colored green, amber or red and opens its measurements, trend, what spaceflight does to it, and what to do.
- **Live NASA space weather.** The dashboard reads NASA's DONKI notifications (solar energetic particles, coronal mass ejections, geomagnetic storms) as a radiation watch that links to the solar storm guide.
- **Reminders and streaks.** Checks due and overdue for each crew member, a schedule calendar, and a daily streak with "crew done today".
- **Report for the flight surgeon.** One button copies or downloads a summary of findings, advice given and readings against baseline.

**How it works**

Each indicator is checked in four steps: (1) absolute safety limits from public medical references, (2) change against the astronaut's own baseline (first 7 readings), (3) a steady trend over 14 days (least-squares line, flagged when R² ≥ 0.6), (4) overdue measurements. The astronaut's status is the worst of all indicators, symptoms and the latest skin scan per body region. To avoid false alarms, one odd reading asks for a re-measure; it only escalates when a second reading agrees or a hard limit is crossed. Skin spots: the AI model returns asymmetry, border, color and size; the app's own code decides OK / Watch / Act and tracks each spot over time, and a guessed size can never escalate a spot on its own. Everything runs in the browser and works offline.

**Worked example (demo crew, simulated data)**

Cmdr. Vega: a spot on the left arm grew from 4 mm to 6.5 mm in 45 days with an irregular border → Act, report to the flight surgeon. Dr. Osei: blood pressure crept from about 121 to 134 mmHg over two weeks → Watch. Nakamura: resting heart rate and sleep drifted while every value still looked normal, and temperature checks were skipped → Watch. Lindqvist: healthy → OK.

**Built honestly**

Every value says where it came from (entered, device, self-report, measured in app, simulated, estimated). Every limit and guide lists its source in the app, and a "Where the numbers come from" panel separates public reference values from HealthLens settings. HealthLens flags changes for review; it is not a medical device and does not diagnose.

**Benefits and impact**

For the crew: a few minutes a day, plain steps, a clear rule for when to act. For flight surgeons: a short report instead of a stream of raw numbers. For mission planners: one routine from the station to Mars. On Earth: the challenge notes these tools could help remote communities. HealthLens works offline in a browser, needs no special hardware to start and assumes the user is not a doctor, so a rural clinic, an Antarctic station or a ship could use the same check-ins and skin tracking and send one clear report to a distant doctor.

**What's next**

Connect real wearables through the existing device-import path; run the skin model on the tablet so scans work with no connection; have doctors review the guides and test the skin rules on public dermatology images (ISIC); send the flight-surgeon report automatically at the next communication window.

**Tools**

React, TypeScript and Vite; three.js for the 3D body (anatomy from BodyParts3D and the HuBMAP Human Reference Atlas, prepared with glTF Transform and meshoptimizer); OpenRouter with free open vision models (NVIDIA Nemotron, Google Gemma) for skin-spot detection, with Zod for the response schema; charts in plain SVG; Vitest for the rule tests; Geist font and Lucide icons; hosted on Vercel.

---

## Use of Super Intelligence (SI)

Selected boxes: Data Analysis and Interpretation; Research or Information Gathering; Building SI/ML Into the Project; Coding, Debugging, or Troubleshooting. (Not shown to judges. No SI-generated images or video, so no watermarks needed. If a field asks for text: "Claude Code (Anthropic) helped write code, tests and draft text, and summarized research; free vision models via OpenRouter run inside the app to find skin spots. The idea, design decisions and review were the team's; all output was reviewed and tested; no NASA branding in SI output.")

---

## NASA Data (Link Text → Link Url)

| Link Text | Link Url |
| --- | --- |
| NASA DONKI space weather notifications (live in the app) | https://ccmc.gsfc.nasa.gov/tools/DONKI/ |
| NASA Open APIs (DONKI notifications endpoint) | https://api.nasa.gov/ |
| NASA Human Research Program: 5 Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ |
| NASA Human System Risks | https://www.nasa.gov/hhp/human-system-risks/ |
| NASA Integrated Medical Model (IMM) | https://www.nasa.gov/nasa-integrated-medical-model-imm-overview/ |
| NASA Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS) | https://www.nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans/ |
| NASA OSDR OSD-238: mouse skin after spaceflight (JAXA MHU-2) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-238 |
| NASA OSDR OSD-239: mouse skin after spaceflight (JAXA MHU-2) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-239 |
| NASA OSDR OSD-240: mouse skin after spaceflight (Rodent Research-5) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-240 |
| NASA OSDR OSD-241: mouse skin after spaceflight (Rodent Research-5) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-241 |
| NASA OSDR OSD-254: mouse skin after spaceflight (Rodent Research-7) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-254 |
| NASA Science: How NASA Will Protect Astronauts From Space Radiation at the Moon | https://science.nasa.gov/science-research/heliophysics/how-nasa-will-protect-astronauts-from-space-radiation-at-the-moon |
| NASA-STD-3001 Volume 1: Crew Health | https://www.nasa.gov/reference/nasa-std-3001v1/ |
| NASA Sleep-Long study (Actiwatch sleep monitoring on the ISS) | https://ntrs.nasa.gov/citations/20090014819 |
| Zwart et al. 2014, Body mass changes during long-duration spaceflight (NASA crew data) | https://pubmed.ncbi.nlm.nih.gov/25197887/ |
| Barger et al. 2014, Sleep deficiency in astronauts (NASA-funded crew study) | https://doi.org/10.1016/S1474-4422(14)70122-X |
| Rooney et al. 2019, Herpes virus reactivation in astronauts (NASA crew study) | https://doi.org/10.3389/fmicb.2019.00016 |
| Crucian et al. 2016, Clinical symptoms during long-duration orbital spaceflight (NASA crew study) | https://pmc.ncbi.nlm.nih.gov/articles/PMC5098747/ |
| Zeitlin et al. 2013, Radiation in transit to Mars (NASA MSL/RAD data) | https://doi.org/10.1126/science.1235989 |
| Mader et al. 2011, Eye changes after long-duration spaceflight (NASA astronaut data) | https://doi.org/10.1016/j.ophtha.2011.06.021 |

## Space Agency Partner & Other Data (Link Text → Link Url)

| Link Text | Link Url |
| --- | --- |
| Brazilian Space Agency (AEB): official challenge video | https://www.youtube.com/watch?v=RERG3gEmdC8 |
| Canadian Space Agency: Bio-Monitor | https://www.asc-csa.gc.ca/eng/sciences/astroskin.asp |
| Canadian Space Agency: Bio-Analyzer | https://www.asc-csa.gc.ca/eng/iss/bio-analyzer.asp |
| Hughson et al. 2016, CSA Vascular study (insulin resistance in flight) | https://doi.org/10.1152/ajpheart.00802.2015 |
| JAXA Mouse Habitat Unit-2 skin study (via NASA OSDR) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-238 |
| Hinkelbein et al. 2020, CPR during spaceflight guideline (DGLRM / ESAM) | https://doi.org/10.1186/s13049-020-00793-y |
| HuBMAP Human Reference Atlas: 3D reference organs, female body (CC BY 4.0) | https://humanatlas.io/3d-reference-library |
| BodyParts3D, © The Database Center for Life Science (CC BY 4.0) | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html |
| Communications Medicine 2024, Spaceflight dermatology transcriptomics | https://doi.org/10.1038/s43856-024-00532-9 |
| Stavnichuk et al. 2020, Bone loss in space travelers | https://doi.org/10.1038/s41526-020-0103-2 |
| Basner et al. 2011, Brief psychomotor vigilance test (PVT-B) | https://doi.org/10.1016/j.actaastro.2011.07.015 |
| American Academy of Dermatology: ABCDEs of melanoma | https://www.aad.org/public/diseases/skin-cancer/find/at-risk/abcdes |
| American Academy of Ophthalmology: Amsler grid | https://www.aao.org/eye-health/tips-prevention/facts-about-amsler-grid-daily-vision-test |
| American Heart Association: Understanding Blood Pressure Readings | https://www.heart.org/bplevels |
| CDC: Diabetes Testing | https://www.cdc.gov/diabetes/diabetes-testing/index.html |
| NIDDK: Low Blood Glucose (Hypoglycemia) | https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia |
| MedlinePlus: Vital signs | https://medlineplus.gov/ency/article/002341.htm |
| MedlinePlus: Pulse | https://medlineplus.gov/ency/article/003399.htm |
| MedlinePlus: Pulse Oximetry | https://medlineplus.gov/lab-tests/pulse-oximetry/ |
| MedlinePlus: Body temperature norms | https://medlineplus.gov/ency/article/001982.htm |
| MedlinePlus: Fever | https://medlineplus.gov/ency/article/003090.htm |
| MedlinePlus: CPR | https://medlineplus.gov/ency/article/000013.htm |
| MedlinePlus: Anaphylaxis | https://medlineplus.gov/ency/article/000844.htm |
| MedlinePlus: Bleeding | https://medlineplus.gov/ency/article/000045.htm |
| MedlinePlus: Burns | https://medlineplus.gov/ency/article/000030.htm |
| MedlinePlus: Head injury first aid | https://medlineplus.gov/ency/article/000028.htm |
| MedlinePlus: Eye emergencies | https://medlineplus.gov/ency/article/000054.htm |
| MedlinePlus: Fainting | https://medlineplus.gov/ency/article/003092.htm |
| MedlinePlus: Chest pain | https://medlineplus.gov/ency/article/003079.htm |
| MedlinePlus: Kidney Stones | https://medlineplus.gov/kidneystones.html |
| OpenRouter (free vision models: NVIDIA Nemotron, Google Gemma) | https://openrouter.ai/ |
| three.js | https://threejs.org/ |
| React | https://react.dev/ |
| Vite | https://vite.dev/ |
| TypeScript | https://www.typescriptlang.org/ |
| Vitest | https://vitest.dev/ |
| Zod | https://zod.dev/ |
| glTF Transform | https://gltf-transform.dev/ |
| meshoptimizer | https://github.com/zeux/meshoptimizer |
| Geist font | https://vercel.com/font |
| Lucide icons | https://lucide.dev/ |
| Bklit UI (chart design reference, no code used) | https://bklit.com/ |
| Vercel (hosting) | https://vercel.com/ |

---

## Before clicking Submit for Judging

- [ ] Demo link opens in a private window, no login, 7 slides or fewer
- [ ] https://healthlens-one.vercel.app opens in a private window
- [ ] Both boxes ticked (Terms, Original work), then **Submit for Judging** before 11:59 p.m. PT
