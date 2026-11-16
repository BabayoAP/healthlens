# Demo Plan (7 slides)

Step-by-step plan for the Project Demonstration. Anyone on the team should be able to build the deck from this file alone.
**Decision:** a 7-slide Google Slides deck with screenshots and 3 short GIFs (18 seconds of motion in total).

## The official rule (copied from the form)

> Please provide a short demonstration (demo) of your project as either a slide presentation (no more than 7 slides, including the title and introduction) or a video (30 seconds or less). Upload your demo to a public hosting platform such as YouTube, Google Drive, GitHub, OneDrive, or Dropbox, and share a link that does not require a password, permission, or registration.
> To be eligible for a Global Award in the NASA Space Apps Challenge, your demo must be accessible through this public link and be no more than 7 slides or longer than 30 seconds.

What that means for us:
- **7 slides, counting the title slide.** No extra "thank you", appendix or hidden slides. Delete every unused slide.
- **Keep all moving parts under 30 seconds in total** (we use 18 s), so the deck can't be read as an over-length video.
- **Public link, no sign-in.** Test it in a private window before pasting it into the form.
- English only. Team name, member names and the challenge name must be on the deck.
- No face, voice or skin of anyone under 18. Only the app's 3D mannequin and screenshots appear. No NASA logos. No AI-generated images (if one is added, it needs a visible "AI-generated" watermark).

## The story (one sentence per slide)

1. HealthLens: your crew's own medic.
2. Halfway to Mars, someone collapses, and Earth is minutes away.
3. One screen shows the whole crew, the body, and where you are.
4. Checking yourself takes a minute, and the app compares you with your own normal.
5. Every flag says what it means and what to do.
6. In an emergency, it walks you through every step.
7. Built on NASA and partner-agency data, and useful on Earth.

The deck matches the challenge video (by the Brazilian Space Agency), which opens with the same scenario as slide 2, and the Project Details text (`docs/form-details.txt`).

---

## Before you capture anything (5 minutes, once)

1. Open **Chrome in a private (Incognito) window**: Ctrl+Shift+N. A private window starts with the demo crew, nothing extra entered, and the location set to **Spacecraft on the way to Mars**. If anything looks off later, close the private window and open a new one.
2. Go to **https://healthlens-one.vercel.app**.
3. Make the window **1440 × 900**: in DevTools (F12) toggle the device toolbar (Ctrl+Shift+M), choose "Responsive", type 1440 and 900, then close DevTools. Or maximize on a 1080p screen. Browser zoom must be **100%** (Ctrl+0).
4. In the sidebar, set the theme to **Light** (bottom of the sidebar). Use Light for every capture so the slides match.
5. Leave **Demo mode** on. The banner "Demo mode: all crew history is simulated" may appear in captures; that's fine and honest.
6. Screenshot tool: **Win+Shift+S** (Snipping Tool), "Rectangle". GIF tool: **ScreenToGif** (free, https://www.screentogif.com): Recorder → drag the frame over the area → Record → Stop → Editor → delete frames before the action starts and after the result → File → Save as GIF. Keep each GIF **under 10 MB** (Editor → Image → Resize to 1280 px wide if it is bigger).
7. Save every capture in the team Google Drive folder **HealthLens / demo**, named as listed below (`s3-dashboard.gif` and so on). Don't put them in the repo.

---

## Slide by slide

Slide size: Google Slides default (16:9). Font: one family throughout (e.g. Inter or Arial). Titles 36–40 pt, body 18–22 pt. Few words; the captures do the talking. Status colors in captions: green = OK, amber = Watch, red = Act, same as the app.

### Slide 1: Title (no motion)

- **Title:** HealthLens
- **Subtitle:** Your crew's own medic, from the space station to Mars.
- **Small text, bottom:** Team Hydrogen Temp · _[full names of every member, as registered]_ · NASA Space Apps Challenge 2026, Irvine · Challenge: Create Health Monitoring Software for Astronauts on Space Missions
- **Image:** `s1-body.png`, the 3D body on the Dashboard.
  - Capture: on the Dashboard (Vega is selected by default), wait until the figure stops loading, then snip just the **Body** card (the figure with the red left arm). Crop out the "Open body map" button.

### Slide 2: The problem (no motion)

- **Title:** Halfway to Mars, a crewmate feels a sharp pain in the chest and collapses. What do you do?
- **Three short points:**
  - No doctor on board. Astronauts are not doctors.
  - An answer from Earth can take up to **44 minutes**.
  - A Mars round trip alone is about **0.66 sievert** of radiation (Zeitlin et al., Science, 2013).
- **Small text, bottom:** Scenario from the official challenge video (Brazilian Space Agency).
- **Image:** `s2-location.png`, the location bar.
  - Capture: on any screen, snip the bar at the very top: "Spacecraft on the way to Mars · Microgravity · Signal to Earth: about 5 minutes each way … · Help is delayed: the crew acts first".

### Slide 3: Meet HealthLens (GIF, 6 s)

- **Title:** The whole crew, the body, and where you are, on one screen
- **Caption under the GIF:** Green, amber or red for each crew member, with the reason in plain words. Click any part of the body to see why.
- **GIF:** `s3-dashboard.gif`, at most **6 seconds**.
  - Record the area from the crew cards down to the bottom of the Body card.
  - Steps while recording: (1) start on the Dashboard with Vega selected; (2) click **Organs** on the Body card (the skin turns see-through); (3) drag the figure a little to turn it; (4) click the **red left arm**. The Body map opens on "Left arm"; stop 1 second after it appears.
  - In the editor, delete the frames before step 2 and after the Body map has loaded.
- **Still fallback** if the GIF fails: `s3-dashboard.png`, the whole Dashboard.

### Slide 4: Check yourself in a minute (GIF, 4 s + three stills)

This slide covers all the checks equally; skin is one of four tiles, not the headline.

- **Title:** Check yourself in a minute
- **Layout:** four equal tiles in a 2 × 2 grid, each with a 3-to-6-word label:
  1. **"Sync your devices, no typing"**: `s4-sync.gif`, at most **4 seconds**.
     - Go to **Check-in** in the sidebar. Record the "Import from devices" panel and the area below it. Click **Sync all (5)**; stop when the "Saved" list appears below. Crop so the five device cards and the first saved rows are visible.
  2. **"Vision and reaction tests"**: `s4-tests.png`.
     - Go to **Tests**. Snip the vision-check card (the letter-E chart) or the reaction-time card, whichever is visible without scrolling.
  3. **"A skin check that never forgets"**: `s4-skin.png`.
     - Go to **Trends**. In the big chart's dropdown pick **Skin spot 1, left arm (size)**, range **All**. Snip the chart: 4 mm rising to 6.5 mm past the 6 mm line, with the red Act badge.
  4. **"Daily symptoms"**: `s4-symptoms.png`.
     - Go to **Check-in**, scroll to "Any symptoms today?". Snip the symptom chips. Don't tick anything yet (slide 6 uses that).
- **One line under the grid:** Every reading is compared with your own normal, so slow changes are caught early.
- **Device note in small text:** Devices are modeled on Canadian Space Agency and NASA station hardware; values in the demo are simulated.

### Slide 5: It tells you what it means (no motion)

- **Title:** Every flag says what it means and what to do
- **Left image:** `s5-insight.png`.
  - Click **T. Nakamura** in the sidebar's crew list, then **Insights**. Snip the first card: what we saw, the first step, and the small trend chart beside it.
- **Right image:** `s5-drift.png`.
  - Still on Nakamura, go to **Trends**. In the big chart pick **Resting heart rate**, range **6W**, with **Baseline** on. Snip the chart: the line creeps up above the baseline while every value is still in the normal range.
- **Caption:** Catches slow drifts a fitness tracker misses (resting heart rate 63 → 70 bpm, every value still "normal"), then gives steps in plain words and says when to call the flight surgeon.

### Slide 6: When it's an emergency (GIF, 8 s)

This answers the challenge video's scenario directly.

- **Title:** Chest pain, halfway to Mars: step by step
- **GIF:** `s6-emergency.gif`, at most **8 seconds**. Rehearse once before recording.
  - Before recording: click **Cmdr. R. Vega** in the crew list, go to **Check-in**, scroll to "Any symptoms today?".
  - Record the whole content area (not the sidebar). Steps: (1) tick **Chest pain**, click **Save symptoms**; (2) click the red **Emergency** button at the bottom of the sidebar; (3) the top panel, "Suggested from today's check-ins", shows **Chest pain or pressure: Cmdr. R. Vega**; click it; (4) click **Next step** twice so the timer and the step checklist are visible; stop.
- **Caption:** 15 guides, most urgent first, picked from NASA's Integrated Medical Model. Adapted to weightlessness (CPR braced against a wall) and to the signal delay: near Earth "call now", on the way to Mars "the crew acts first". The timed log is copied as a report for the ground.
- **Still fallback:** `s6-emergency.png`, the Emergency screen with the three priority groups.
- **Afterwards:** close the private window (the ticked symptom stays saved in it).

### Slide 7: Built on NASA data, useful on Earth (no motion)

- **Title:** Built on NASA data. Useful on Earth.
- **Left column, "NASA data in the app":**
  - Live NASA DONKI space weather (radiation watch)
  - NASA Human Research Program: 5 hazards of spaceflight
  - NASA OSDR spaceflight skin studies OSD-238 to OSD-254
  - NASA Integrated Medical Model (the 15 emergency guides)
  - NASA crew studies on sleep, body mass and eyes (SANS)
- **Middle column, "Partner agencies":** Brazilian Space Agency (challenge scenario) · Canadian Space Agency (Bio-Monitor, Bio-Analyzer, Vascular study) · JAXA (skin study via OSDR)
- **Right column, "On Earth":** Works offline in a browser and assumes no medical training, for rural clinics, Antarctic stations and ships.
- **Bottom:** **https://healthlens-one.vercel.app** plus a QR code to it.
  - QR code: in Chrome, open the site, right-click anywhere on the page → **Create QR code for this page** → Download. Insert the PNG.
- **Optional small image:** `s7-weather.png`, the "Radiation watch: space weather" card from the Dashboard (scroll down).
- **Small text:** Not a medical device. HealthLens flags changes for review; it does not diagnose. Demo crew data is simulated.

**Motion total: 6 + 4 + 8 = 18 seconds** (limit 30). If a GIF runs long, trim it rather than adding slides.

---

## Putting the deck together

1. Google Drive → New → Google Slides. Name it **HealthLens: NASA Space Apps 2026 demo**.
2. Make exactly 7 slides as above. Insert images and GIFs with Insert → Image → Upload from computer (GIFs play in Slides).
3. Check: no slide is hidden (right-click a slide; "Skip slide" must be off), no empty slides, every GIF loops, every slide makes sense as a still picture.
4. File → Download → PDF and keep the PDF in the Drive folder as a backup (GIFs don't move in a PDF, which is why each slide has to work as a still).

## Publishing and the link

1. In the deck: **Share** → General access → **Anyone with the link** → **Viewer** → Copy link.
2. Paste that link into a **private window** where you are not signed in. It must open the deck with no sign-in prompt. If it asks for access, the setting above wasn't saved.
3. Paste the full link (starting with `https://docs.google.com/presentation/...`) into the form's **Project Demonstration** field.
4. Count the slides one last time: **7**.

## Who does what (fill in now)

| Task | Person | Done |
| --- | --- | --- |
| Captures for slides 1, 2, 3, 7 | | |
| Captures for slides 4, 5, 6 | | |
| Build the deck, share link, test in private window | | |
| Paste the link into the form and Save Progress | | |

## Idea parking lot

- Swap slide 3's GIF for a 3-second turn of the 3D body with Organs and Skeleton on, if the click-through is hard to record.
- Show the location changing on slide 6: same guide with "Space station" picked shows "Call the flight surgeon now. You can talk live."
