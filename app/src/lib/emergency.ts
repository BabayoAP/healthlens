import type { Environment } from './environment';
import { formatValue, indicatorById } from './indicators';
import type { SourceId } from './sources';
import { symptomById } from './symptoms';
import type { IndicatorId, Reading, SymptomLog } from './types';

/**
 * Emergency guides (PRD §5.13). One short step per screen, sorted by priority.
 *
 * REFERENCE CONTENT for the hackathon demo, based on general first-aid practice (MedlinePlus pages
 * listed per guide), the DGLRM/ESAM guideline for CPR in microgravity, and public NASA descriptions of
 * spaceflight medical risks (the Integrated Medical Model's condition list) and radiation procedures.
 * Not reviewed by a clinician and not a replacement for mission medical procedures.
 */
export interface EmergencyStep {
  title: string;
  detail: string;
  /** Something to measure and write down during this step */
  log?: string;
}

/** 1 = life-threatening, act now · 2 = urgent, act within minutes · 3 = serious, act within the hour */
export type Priority = 1 | 2 | 3;

export const PRIORITY_INFO: Record<Priority, { label: string; action: string }> = {
  1: { label: 'Life-threatening', action: 'Act now. Seconds and minutes matter.' },
  2: { label: 'Urgent', action: 'Act within minutes. It can get worse fast.' },
  3: { label: 'Serious', action: 'Act within the hour and keep watching.' },
};

export interface EmergencyGuide {
  id: string;
  title: string;
  priority: Priority;
  /** When to use this guide, in one line */
  when: string;
  /** How to recognize it */
  signs: string[];
  /** Common mistakes to avoid */
  doNot?: string[];
  steps: (env: Environment) => EmergencyStep[];
  sources: SourceId[];
  /** Check-in data that suggests this guide: urgent symptom ids (`symptoms.ts`) or an indicator at Act */
  triggers?: { symptoms?: string[]; indicators?: { id: IndicatorId; direction: 'low' | 'high' }[] };
}

const gravity = (env: Environment) => env.id === 'moon' || env.id === 'mars' || env.id === 'rover';

export const EMERGENCY_GUIDES: EmergencyGuide[] = [
  // ---------- Priority 1: life-threatening ----------
  {
    id: 'cardiac-arrest', title: 'Not responding, not breathing normally', priority: 1,
    when: 'Someone does not respond when you shout and tap them, and is not breathing or only gasping.',
    signs: ['No response to voice or a firm tap on the shoulder', 'No breathing, or only gasping', 'Blue or gray lips and skin'],
    doNot: ['Do not wait for a reply from the ground before starting chest compressions.', 'Do not stop compressions for more than 10 seconds.'],
    steps: (env) => [
      { title: 'Call the crew', detail: 'Shout for every crewmate. One starts compressions, one gets the defibrillator (AED) and the medical kit, one calls the ground.' },
      { title: 'Check breathing', detail: 'Tilt the head back and look, listen and feel for breathing for no more than 10 seconds. Gasping is not normal breathing.' },
      gravity(env)
        ? { title: 'Lay them flat and compress', detail: 'Lay the person on their back on a firm surface. Push hard and fast in the center of the chest: 5 to 6 cm deep, 100 to 120 a minute. Let the chest come all the way back up.' }
        : { title: 'Compress in weightlessness', detail: 'Strap the person to the medical restraint board if it is within reach. If not, start at once: wrap your legs around their back, or brace your feet against a wall, and push hard and fast in the center of the chest, 5 to 6 cm deep, 100 to 120 a minute. Once they are strapped down, a rescuer can brace against the opposite wall (handstand position).' },
      { title: 'Use the defibrillator', detail: 'Turn the AED on and follow its voice prompts. Dry the chest, place the pads, and make sure no one, and no floating object, touches the person during the shock.' },
      { title: 'Breathe for them', detail: 'If trained: 30 compressions, then 2 breaths with the bag-valve mask from the medical kit. If not, keep doing compressions only.', log: 'Time of collapse, time CPR started, each shock' },
      { title: 'Swap every 2 minutes', detail: `Change the person doing compressions every 2 minutes, at the AED's rhythm check. ${env.helpAdvice}` },
      { title: 'Keep going', detail: 'Continue until the person breathes normally, the AED says otherwise, or the flight surgeon or crew medical officer tells you to stop.', log: 'Times of every rhythm check and swap' },
    ],
    sources: ['cprMicrogravity', 'mlCpr', 'nasaImm'],
  },
  {
    id: 'low-oxygen', title: 'Low oxygen or trouble breathing', priority: 1,
    when: 'SpO₂ at 92% or lower, shortness of breath, blue lips, or confusion.',
    signs: ['SpO₂ at 92% or lower', 'Fast breathing (25 or more a minute) or struggling to breathe', 'Blue lips, confusion or drowsiness'],
    doNot: ['Do not leave the person alone.', 'Do not assume it is the sensor until you have checked on a second finger.'],
    steps: (env) => [
      { title: 'Stop and get help', detail: 'Stop what you are doing. Call a crewmate to stay with you. Do not stay alone.' },
      { title: 'Check the air first', detail: 'Look at the cabin oxygen and carbon dioxide readings. Ask whether anyone else has a headache, dizziness or shortness of breath. If the air is the problem, everyone puts on emergency masks and moves to a different module, then follow the "Smoke, fire or toxic air" guide.' },
      { title: 'Sit upright', detail: 'Sit or hold yourself upright. Loosen tight clothing. Breathe slowly in through the nose and out through the mouth.' },
      { title: 'Check the reading', detail: 'Warm the finger, re-seat the oximeter and measure again on another finger. Count breaths for 30 seconds.', log: 'SpO₂, heart rate and breathing rate, with the time' },
      { title: 'Give oxygen', detail: 'If SpO₂ is still 92% or lower, give oxygen from the medical kit as its instructions say.' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
      { title: 'Keep monitoring', detail: 'Measure every 5 minutes until SpO₂ is 95% or more for 30 minutes. If the person stops responding or stops breathing normally, open "Not responding, not breathing normally".', log: 'SpO₂, heart rate and breathing rate every 5 minutes' },
    ],
    sources: ['mlSpo2', 'mlVitals', 'hrpHazards'],
    triggers: { symptoms: ['breathing'], indicators: [{ id: 'spo2', direction: 'low' }, { id: 'respRate', direction: 'high' }, { id: 'respRate', direction: 'low' }] },
  },
  {
    id: 'chest-pain', title: 'Chest pain or pressure', priority: 1,
    when: 'Pain, pressure or squeezing in the chest, especially with sweating, nausea or shortness of breath.',
    signs: ['Pressure, squeezing or pain in the chest lasting more than a few minutes', 'Pain spreading to the arm, back, neck or jaw', 'Sweating, nausea, shortness of breath or lightheadedness'],
    doNot: ['Do not let the person exercise or work "to see if it passes".', 'Do not give aspirin if they are allergic to it or the medical kit card says not to.'],
    steps: (env) => [
      { title: 'Stop all activity', detail: 'The person stops working and rests, sitting or held upright. A crewmate stays with them.' },
      { title: 'Measure', detail: 'Measure heart rate, blood pressure and SpO₂. If the smart shirt or an ECG is available, start a recording now.', log: 'Time the pain started, heart rate, blood pressure, SpO₂' },
      { title: 'Medical kit', detail: 'Follow the medical kit card for chest pain. It usually means chewing an aspirin (unless allergic) and giving oxygen if SpO₂ is below 94%.' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
      { title: 'Get the AED ready', detail: 'Bring the defibrillator next to the person and turn it on. If they stop responding, open "Not responding, not breathing normally".' },
      { title: 'Keep monitoring', detail: 'Repeat the measurements every 5 minutes. Note whether the pain changes.', log: 'Pain from 0 to 10, heart rate, blood pressure, SpO₂ every 5 minutes' },
    ],
    sources: ['mlChestPain', 'hrpHazards'],
    triggers: { symptoms: ['chestPain'] },
  },
  {
    id: 'anaphylaxis', title: 'Severe allergic reaction', priority: 1,
    when: 'Swelling of the face, lips or throat, trouble breathing or a rash spreading fast after a food, drug or sting.',
    signs: ['Swelling of the lips, tongue or throat', 'Wheezing, a tight throat or trouble breathing', 'Hives spreading fast, dizziness or fainting'],
    doNot: ['Do not wait to see if it gets better before using the epinephrine injector.'],
    steps: (env) => [
      { title: 'Use the epinephrine injector', detail: 'Give the epinephrine auto-injector from the medical kit into the outer thigh now, through clothing if needed. Note the time.', log: 'Time of each injection' },
      { title: 'Position', detail: gravity(env) ? 'Lay the person down with legs raised. If breathing is hard, let them sit up instead.' : 'Keep the person upright if breathing is hard. Strap them loosely so they do not drift.' },
      { title: 'Stop the trigger', detail: 'Remove what caused it if you know: food, drug, or a material or chemical on the skin.' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
      { title: 'Second dose', detail: 'If symptoms do not improve in 5 to 15 minutes, give a second injector if the kit has one.' },
      { title: 'Watch for hours', detail: 'Symptoms can return hours later. Someone stays with the person for at least 4 hours. If they stop breathing normally, open "Not responding, not breathing normally".', log: 'SpO₂, heart rate and breathing every 10 minutes' },
    ],
    sources: ['mlAnaphylaxis'],
  },
  {
    id: 'toxic-air', title: 'Smoke, fire or toxic air', priority: 1,
    when: 'A smoke or air-quality alarm, a burning smell, a visible leak, or several crew getting headaches or eye irritation at once.',
    signs: ['Smoke, a burning or chemical smell', 'Several people with headache, cough, dizziness or stinging eyes', 'A smoke, toxic-gas or carbon dioxide alarm'],
    doNot: ['Do not stay to find the cause before you are protected.', 'Do not take off your mask until the air is confirmed safe.'],
    steps: (env) => [
      { title: 'Mask on', detail: 'Everyone puts on an emergency breathing mask now.' },
      { title: 'Alert and leave', detail: 'Tell the whole crew. Move to a clean module or area, upwind of the leak if outside, and close the hatch behind you.' },
      { title: 'Count the crew', detail: 'Make sure everyone is out and accounted for.', log: 'Who was where, and when symptoms started' },
      { title: 'Follow the alarm procedure', detail: `Follow the vehicle’s fire or toxic-atmosphere procedure. ${env.helpAdvice}` },
      { title: 'Check each person', detail: 'Check SpO₂, breathing rate and eyes for everyone exposed. Flush irritated eyes with the eyewash for 15 minutes.', log: 'SpO₂ and breathing rate for each person' },
      { title: 'Afterwards', detail: 'Watch for coughing or breathing trouble for the next 24 hours: lung damage can show up late.' },
    ],
    sources: ['nasaImm', 'hrpHazards'],
  },
  {
    id: 'bleeding', title: 'Severe bleeding', priority: 1,
    when: 'Blood that spurts, pours or soaks through a dressing.',
    signs: ['Blood spurting or pouring', 'Blood soaking through cloth or gauze within minutes', 'Pale, cold, sweaty skin or confusion (signs of shock)'],
    doNot: ['Do not remove an object stuck in the wound.', 'Do not lift a soaked dressing to check: add more on top.'],
    steps: (env) => [
      { title: 'Protect yourself', detail: gravity(env) ? 'Put on gloves and eye protection.' : 'Put on gloves and eye protection. In weightlessness blood forms floating drops: catch them with gauze or towels.' },
      { title: 'Press hard', detail: 'Press directly on the wound with gauze from the medical kit and keep pressing, hard, for at least 10 minutes.' },
      { title: 'Tourniquet if needed', detail: 'On an arm or leg, if pressing does not stop it, put the tourniquet from the kit 5 to 8 cm above the wound and tighten until the bleeding stops.', log: 'Time the tourniquet went on' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
      { title: 'Watch for shock', detail: 'Keep the person warm. Check heart rate and blood pressure every 5 minutes. A fast pulse and falling pressure mean shock.', log: 'Heart rate and blood pressure every 5 minutes' },
    ],
    sources: ['mlBleeding', 'nasaImm'],
  },

  // ---------- Priority 2: urgent ----------
  {
    id: 'decompression', title: 'Decompression sickness after a spacewalk', priority: 2,
    when: 'Joint pain, numbness, itching or confusion during or after a spacewalk or a pressure change.',
    signs: ['Deep, aching pain in a joint (shoulder, elbow, knee)', 'Itching, a blotchy rash, numbness or tingling', 'Confusion, vision changes, weakness or trouble breathing (serious)'],
    doNot: ['Do not "work through" joint pain during a spacewalk: report it at once.'],
    steps: (env) => [
      { title: 'Stop and report', detail: 'Stop the spacewalk or task and tell the crew and the ground. Note exactly where and when it started.', log: 'Symptom, body part and time it started' },
      { title: 'Breathe oxygen', detail: 'Give 100% oxygen from the medical kit or the suit right away.' },
      { title: 'Pressure treatment', detail: 'Follow the mission\'s decompression sickness procedure. On the space station this uses the spacesuit, sealed and pressurized, as a small pressure chamber.' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
      { title: 'Check nerves and breathing', detail: 'Check strength in both hands and feet, speech and vision every 15 minutes. Confusion, weakness or trouble breathing makes this life-threatening.', log: 'Results of each check' },
    ],
    sources: ['nasaImm'],
  },
  {
    id: 'head-injury', title: 'Head injury', priority: 2,
    when: 'A blow to the head, especially with confusion, vomiting, a bad headache or passing out.',
    signs: ['Passed out, even briefly', 'Confusion, repeated questions, slurred speech', 'Vomiting, a worsening headache, or pupils of different sizes'],
    doNot: ['Do not leave the person alone for the next 24 hours.', 'Do not give sleeping pills or alcohol.'],
    steps: (env) => [
      { title: 'Keep still', detail: 'Keep the head and neck still if the person passed out or has neck pain. Strap them gently if needed.' },
      { title: 'Check alertness', detail: 'Ask their name, where they are and what day it is. Check that both pupils are the same size.', log: 'Answers, pupil sizes and the time' },
      { title: 'Cold pack', detail: 'Put a cold pack on any swelling for 20 minutes. Press on bleeding from the scalp with gauze.' },
      { title: 'Vomiting', detail: gravity(env) ? 'If they vomit, roll them onto their side, keeping the neck in line.' : 'Keep an emesis bag ready. In weightlessness vomit does not fall away, so turn the face to the bag.' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
      { title: 'Check every hour', detail: 'Repeat the alertness check every hour for 24 hours, waking them if needed. Worse headache, more confusion or another vomit means it is getting worse.', log: 'Alertness check every hour' },
    ],
    sources: ['mlHeadInjury', 'nasaImm'],
  },
  {
    id: 'low-sugar', title: 'Low blood sugar', priority: 2,
    when: 'Shaky, sweaty, confused or acting strangely, or a blood sugar under 70 mg/dL.',
    signs: ['Shaking, sweating, a fast heartbeat, hunger', 'Confusion, irritability or acting unlike themselves', 'Blood sugar below 70 mg/dL (below 54 is serious)'],
    doNot: ['Do not give food or drink to someone too drowsy to swallow safely.'],
    steps: (env) => [
      { title: 'Measure if you can', detail: 'Check blood sugar with the blood analyzer. If you cannot check quickly, treat anyway.', log: 'Blood sugar and the time' },
      { title: 'Fast sugar', detail: 'If they can swallow: 15 to 20 grams of fast sugar, such as glucose tablets or juice from the food stores.' },
      { title: 'Wait 15 minutes', detail: 'Wait 15 minutes, then measure again. If still below 70, repeat the sugar.' },
      { title: 'Too drowsy to swallow', detail: `Use the glucagon from the medical kit as its card says. ${env.helpAdvice}` },
      { title: 'Afterwards', detail: 'Once above 70, eat a snack or the next meal. Note what was missed (a meal, a long shift, a spacewalk).' },
    ],
    sources: ['niddkLow', 'hughson2016'],
    triggers: { indicators: [{ id: 'glucose', direction: 'low' }] },
  },
  {
    id: 'fainting', title: 'Fainting or nearly fainting', priority: 2,
    when: 'Someone passes out or feels they are about to, especially after standing up or after landing.',
    signs: ['Lightheaded, tunnel vision, pale and sweaty', 'Passed out for a short time', 'Common after landing, when gravity returns'],
    doNot: ['Do not sit them up fast once they come round.'],
    steps: (env) => [
      { title: 'Position', detail: gravity(env) ? 'Lay them flat and raise the legs about 30 cm. After landing, this is common: blood pools in the legs.' : 'Strap them loosely so they do not drift into equipment. Loosen tight clothing.' },
      { title: 'Check breathing', detail: 'If they do not come round within 1 minute, or are not breathing normally, open "Not responding, not breathing normally".' },
      { title: 'Measure', detail: 'Measure heart rate, blood pressure, SpO₂ and blood sugar.', log: 'Heart rate, blood pressure, SpO₂, blood sugar and how long they were out' },
      { title: 'Fluids', detail: 'Once fully awake, give water and some salt (a salty snack). Get up slowly, in stages.' },
      { title: 'Contact the flight surgeon', detail: `Report every faint. Chest pain, a racing or irregular pulse, or fainting during exercise needs a call now. ${env.helpAdvice}` },
    ],
    sources: ['mlFainting', 'hrpHazards'],
    triggers: { symptoms: ['fainting'] },
  },
  {
    id: 'solar-storm', title: 'Solar particle event (radiation storm)', priority: 2,
    when: 'A solar storm alert from mission control or space-weather monitoring, or a dosimeter alarm.',
    signs: ['A storm alert from mission control or the space-weather feed', 'A dosimeter alarm or a sharp rise in dose rate'],
    doNot: ['Do not leave the shelter until the all-clear.'],
    steps: (env) => [
      { title: 'Alert the whole crew', detail: 'Tell everyone now. Stop non-essential work.' },
      { title: 'Take shelter', detail: env.shelter },
      { title: 'Bring what you need', detail: 'Take your personal dosimeter, water, food, the medical kit and a way to communicate. You may be there for hours.' },
      { title: 'Log your dose', detail: 'Read your dosimeter when you enter the shelter and every 30 minutes.', log: 'Dosimeter reading and time, for each crew member' },
      { title: 'Contact mission control', detail: `${env.helpAdvice} Ask for the expected length of the storm.` },
      { title: 'Stay until all-clear', detail: 'Stay sheltered until mission control or the radiation monitor confirms the storm has passed. Storms can last from hours to a couple of days.' },
      { title: 'Afterwards', detail: 'Log the total dose. For the next 2 weeks, check in daily and watch for nausea, unusual tiredness or reddened skin. Do a full skin scan this week.', log: 'Total dose for the event' },
    ],
    sources: ['nasaShelter', 'donki', 'hrpHazards'],
  },
  {
    id: 'eye-injury', title: 'Eye injury or something in the eye', priority: 2,
    when: 'Debris, a chemical or a blow to the eye. Floating debris makes this one of the most common injuries in weightlessness.',
    signs: ['Pain, watering, redness or a feeling of grit', 'A chemical splash', 'Blurred or lost vision, or blood in the eye'],
    doNot: ['Do not rub the eye.', 'Do not try to remove an object stuck in the eye.'],
    steps: (env) => [
      { title: 'Chemical? Flush now', detail: 'For a chemical, flush the eye with the eyewash or clean water for at least 15 minutes, holding the lids open. Do this before anything else.' },
      { title: 'Debris', detail: 'For grit, blink and flush with eyewash. Look under the lids in good light. Put on goggles so more debris cannot get in.' },
      { title: 'Stuck object or a blow', detail: 'Do not press on the eye. Cover both eyes loosely with a shield or cup, since moving one eye moves the other.' },
      { title: 'Check vision', detail: 'Check each eye on its own: can they count fingers, read small text?', log: 'Vision in each eye and the time' },
      { title: 'Contact the flight surgeon', detail: `Any change in vision, a chemical, or pain that lasts needs a report now. ${env.helpAdvice}` },
    ],
    sources: ['mlEye', 'nasaImm'],
  },
  {
    id: 'mental-crisis', title: 'Severe distress or thoughts of self-harm', priority: 2,
    when: 'A crewmate is panicking, cannot cope, talks about hurting themselves, or acts in a way that puts the crew at risk.',
    signs: ['Talk of hopelessness or of hurting themselves', 'Panic: racing heart, fast breathing, feeling of doom', 'Not sleeping, withdrawn, or very agitated'],
    doNot: ['Do not leave the person alone if they talk about hurting themselves.', 'Do not argue or make light of it.'],
    steps: (env) => [
      { title: 'Stay with them', detail: 'Move somewhere quiet with one crewmate they trust. Speak calmly and listen. Ask directly whether they are thinking of hurting themselves: asking does not put the idea there.' },
      { title: 'Make it safe', detail: 'If there is any risk, keep medicines and sharp tools away from them, and make sure someone is with them at all times.' },
      { title: 'Slow the breathing', detail: 'For panic: breathe in for 4 counts, hold for 4, out for 6. Do it together.' },
      { title: 'Private call', detail: `Set up a private conference with the flight surgeon or the mission psychologist. ${env.helpAdvice}` },
      { title: 'Follow-up', detail: 'Agree a plan for the next 24 hours: rest, lighter duties, who checks in and when. Log mood, sleep and stress daily in the check-in.', log: 'What happened, what helped, the plan' },
    ],
    sources: ['hrpRisks', 'hrpHazards'],
  },

  // ---------- Priority 3: serious ----------
  {
    id: 'burns', title: 'Burns', priority: 3,
    when: 'Heat, electrical or chemical burns. Large, deep or facial burns, and any electrical burn, are urgent.',
    signs: ['Red, blistered or white / charred skin', 'Burns on the face, hands, joints or genitals, or larger than the person\'s palm', 'Any electrical burn, which can be deeper than it looks'],
    doNot: ['Do not use ice, butter or ointment.', 'Do not pop blisters.'],
    steps: (env) => [
      { title: 'Stop the burn', detail: 'Turn off power before touching someone after an electrical injury. Brush off dry chemicals, then flush with water.' },
      { title: 'Cool it', detail: gravity(env) ? 'Cool the burn under cool (not cold) running water for 20 minutes.' : 'Water does not run in weightlessness: hold wet, cool towels or cold packs wrapped in cloth on the burn for 20 minutes.' },
      { title: 'Cover', detail: 'Remove rings and tight items near the burn. Cover loosely with a clean, non-stick dressing.' },
      { title: 'Check size and depth', detail: 'Use the person\'s palm as about 1% of their skin. Note blisters, white or charred areas.', log: 'Location, size in palms, how deep it looks' },
      { title: 'Contact the flight surgeon', detail: `Report burns bigger than a palm, on the face, hands or joints, or any electrical burn now. ${env.helpAdvice}` },
    ],
    sources: ['mlBurns', 'nasaImm'],
  },
  {
    id: 'kidney-stone', title: 'Kidney stone pain', priority: 3,
    when: 'Severe pain in the side or back that comes in waves, sometimes with blood in the urine. Bone loss in space raises the risk.',
    signs: ['Sharp pain in the side or back, below the ribs, coming in waves', 'Pain spreading to the lower belly or groin', 'Pink or brown urine, nausea'],
    doNot: ['Do not ignore a fever with this pain: that makes it urgent.'],
    steps: (env) => [
      { title: 'Pain relief', detail: 'Give pain relief from the medical kit as its card for kidney stones says.' },
      { title: 'Drink', detail: 'Drink plenty of water, unless the person is vomiting.' },
      { title: 'Measure', detail: 'Take temperature, heart rate and blood pressure.', log: 'Pain from 0 to 10, temperature, and when each wave of pain came' },
      { title: 'Watch for infection', detail: 'A fever, chills or not being able to pass urine make this urgent: report it at once.' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
    ],
    sources: ['mlKidneyStones', 'nasaImm', 'boneMeta2020'],
  },
];

export const emergencyById = Object.fromEntries(EMERGENCY_GUIDES.map((g) => [g.id, g])) as Record<string, EmergencyGuide>;

/** Guides sorted by priority, then in list order */
export const byPriority = (guides: EmergencyGuide[] = EMERGENCY_GUIDES) =>
  [...guides].sort((a, b) => a.priority - b.priority);

export interface Suggestion {
  guide: EmergencyGuide;
  astronautId: string;
  /** What in the crew member's data points to this guide */
  why: string;
}

const SUGGEST_WINDOW_MS = 24 * 3_600_000;

/**
 * Guides the crew's own data points to right now: an urgent symptom logged in the last 24 hours,
 * or a latest reading past an Act limit in the guide's direction. Most urgent first.
 */
export function suggestEmergencies(
  astronautIds: string[], readings: Reading[], symptomLogs: SymptomLog[], now: number,
): Suggestion[] {
  const out: Suggestion[] = [];
  for (const astronautId of astronautIds) {
    const logs = symptomLogs.filter((l) => l.astronautId === astronautId && now - Date.parse(l.takenAt) <= SUGGEST_WINDOW_MS);
    const latest = (id: IndicatorId) => readings
      .filter((r) => r.astronautId === astronautId && r.indicator === id)
      .reduce<Reading | undefined>((a, r) => (!a || r.takenAt > a.takenAt ? r : a), undefined);
    for (const guide of EMERGENCY_GUIDES) {
      const symptom = guide.triggers?.symptoms?.find((s) => logs.some((l) => l.symptoms.includes(s)));
      if (symptom) {
        out.push({ guide, astronautId, why: `${symptomById[symptom]?.label ?? symptom} reported` });
        continue;
      }
      for (const t of guide.triggers?.indicators ?? []) {
        const r = latest(t.id);
        const lim = indicatorById[t.id].limits;
        if (!r || !lim || now - Date.parse(r.takenAt) > SUGGEST_WINDOW_MS) continue;
        const hit = t.direction === 'low' ? lim.actBelow !== undefined && r.value < lim.actBelow : lim.actAbove !== undefined && r.value >= lim.actAbove;
        if (hit) {
          out.push({ guide, astronautId, why: `${indicatorById[t.id].label} ${formatValue(indicatorById[t.id], r.value)}` });
          break;
        }
      }
    }
  }
  return out.sort((a, b) => a.guide.priority - b.guide.priority);
}
