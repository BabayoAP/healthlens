# Demo Plan (7 slides)

Living plan for the Project Demo. **Anyone can edit: add ideas at the bottom, update the slide table when we decide.**
Decision (Nov 14): **7-slide deck**, showing the working app through short GIFs/clips.

## Rules we must not break
- **Max 7 slides, including title and intro.** Over = not eligible for global judging.
- **All moving footage in the whole deck adds up to 30 seconds or less.** The rule is "30-second video *or* 7 slides". A deck stuffed with long clips could be read as a video over the limit, so we stay under 30 s total to be safe either way. Budget per slide is in the table.
- GIFs **loop silently, no audio**. Each slide must still make sense as a still image (judges may view a PDF or a paused frame).
- Slides must be in **English**, with **team name, member names, and the challenge name** somewhere (official requirement).
- **No faces, voices, or skin of anyone under 18.** Skin images come from public datasets, labeled.
- AI-generated images need a **visible watermark**. No NASA logos.
- Host as a **public Google Slides link** (GIFs play there; they do not play in a PDF). Test in a private window. Keep a PDF copy as backup.
- Readable font size, few words per slide. The official tips ask for: an image of the project, the user experience, and how NASA data makes it possible.

## Slide plan

| # | Slide | On screen | Motion (budget) | Status |
| --- | --- | --- | --- | --- |
| 1 | **Title** | HealthLens + tagline "A health check-up that never forgets." Team Hydrogen Temp, member names, challenge name | none | to do |
| 2 | **Problem** | "No dermatologist on Mars." Up to ~20 min comm delay each way; astronauts aren't doctors; stat: a Mars round trip alone is about 0.66 Sv of radiation (Zeitlin et al., Science 2013, measured by Curiosity on the way to Mars) | none | stat ready; slide to do |
| 3 | **Meet HealthLens** | Crew dashboard: green / amber / red at a glance, reason in plain words | GIF: dashboard → click Vega's card → body map opens with the left arm red → detail panel (≤5 s) | can record now |
| 4 | **Skin check that never forgets** | Same spot, Day 97 vs Day 142: 4 mm → 6.5 mm → **Act** | GIF: upload photo → spots marked → comparison table (≤8 s) | real skin analysis is in; record once tested with an API key + ISIC images |
| 5 | **Catches what a fitness tracker misses** | Slow drift flagged while every value is still "normal" (heart rate 63 → 70); live entry turns status amber | GIF: on Check-in, pick Lindqvist (healthy), enter BP 150/95, save → status turns red with the reason (≤6 s). Still image option: Nakamura's Trends screen, heart rate creeping up past the baseline line while still "normal" | can record now |
| 6 | **Tells you what to do** | Insight card (what we saw / why / what to do / when to get help) + "Copy report" for the flight surgeon + emergency mode: 15 guides by priority, suggested from the crew's own data, CPR adapted for weightlessness, comm delay | GIF: tick "Chest pain" on Check-in → press Emergency → suggested guide on top → open it, step timer running (≤6 s). Still image: the priority list, or Vega's insight card | can record now |
| 7 | **Built on NASA data · next** | Exact datasets (HRP risks, OSDR skin studies OSD-238…254), "simulated" labels = honest data, Earth spin-off for remote clinics, live NASA DONKI space-weather panel (screenshot of "Radiation watch"), live link + QR | none | data is in the app; needs deploy link |

**Motion total: 25 s of 30 s.** If a clip grows, cut another.

## How to record the clips
- Record the **deployed site in demo mode** at a fixed window size (e.g. 1280×720), light or dark theme consistently.
- Tools: ScreenToGif (Windows) or Kap / QuickTime + ezgif (Mac). Keep each GIF under ~10 MB so Slides accepts it.
- Trim hard: start on the action, end on the result. Add a 1 s hold on the final frame so the result is readable.
- Save raw clips in a shared Drive folder, not in the repo.

## Story in one breath
On Mars there is no doctor → HealthLens lets the crew check themselves → it remembers every spot and every reading → it notices slow changes early → it says what to do in plain words → built on NASA research, and useful on Earth.

## Open questions
- Which stat for slide 2? (needs a source)
- Who records the clips, and who owns the deck?
- QR code to the live site on slide 7?

## Idea parking lot
_(add anything here: lines, visuals, clip ideas. Promote to the table when agreed.)_
- **Open with the challenge video's own scenario** (slide 2 or 6): "Halfway to Mars, a crewmate feels sharp chest pain and collapses." The app starts on the spacecraft to Mars: mission bar shows ~5 min signal delay and "the crew acts first"; tick Chest pain → Emergency suggests the chest-pain guide → if they collapse, the CPR-in-weightlessness guide. That answers the video word for word.
- Slide 3: GIF of the 3D anatomy turning with the Skin layer on, then Organs (see-through skin), with Vega's left arm in red (≤4 s).
- Slide 3 or 5: GIF of **"Sync all"** on Check-in (5 devices modeled on CSA's Bio-Monitor, NASA's Actiwatch and SLAMMD, CSA's Bio-Analyzer) filling the check-in with no typing (≤4 s). Line: "Real space hardware, simulated here, no typing."
- Slide 7: name the partner agency: Canadian Space Agency hardware (Bio-Monitor, Bio-Analyzer) and study (Hughson 2016) behind device import and blood sugar.
-
