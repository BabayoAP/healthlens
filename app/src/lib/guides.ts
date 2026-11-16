import type { Environment } from './environment';
import type { SourceId } from './sources';
import type { IndicatorId } from './types';

/**
 * Measurement guides (PRD §5.12): how to measure, why it matters in space, what to do if it looks wrong.
 * Written for people who are not doctors.
 *
 * REFERENCE CONTENT for the hackathon demo. Numbers and "why" statements were checked against the
 * sources listed on each guide (see `sources.ts`); the step-by-step advice is general health and
 * first-aid practice. Not reviewed by a clinician.
 */
/** Screens where a check is done */
export type CheckTab = 'check-in' | 'skin' | 'tests';

export interface Guide {
  id: string;
  title: string;
  /** Indicators this guide covers (empty for skin and symptoms, which are not numeric indicators) */
  indicators: IndicatorId[];
  /** Screen where the check is done. Default: `check-in` */
  tab?: CheckTab;
  /** Which of NASA's five spaceflight hazards this relates to */
  hazard: string;
  how: (env: Environment) => string[];
  why: string;
  normal: string;
  ifAbnormal: string[];
  /** When to bring in the medical officer / flight surgeon */
  escalate: string;
  /** Sources for the numbers and the spaceflight explanation */
  sources: SourceId[];
}

const same = (steps: string[]) => () => steps;

export const GUIDES: Guide[] = [
  {
    id: 'heartRate', title: 'Resting heart rate', indicators: ['heartRate'], hazard: 'Altered gravity',
    how: same([
      'Sit or float still for 5 minutes. No exercise or caffeine in the last 30 minutes.',
      'Use the pulse oximeter or wearable, or place two fingers on your wrist below the thumb.',
      'Count beats for 30 seconds and double it.',
    ]),
    why: 'Without gravity, body fluid shifts toward the head and the heart does less work, so it slowly loses conditioning. A resting heart rate that creeps up can be an early sign of deconditioning, dehydration, poor sleep, stress or illness.',
    normal: '60 to 100 beats per minute for most adults, and 40 to 60 for well-trained athletes. What matters most is your own baseline.',
    ifAbnormal: [
      'Rest for 5 more minutes and measure again.',
      'Drink water, and think about last night\'s sleep, recent exercise and caffeine.',
      'If it is still 10 or more above your baseline, measure morning and evening for 3 days.',
    ],
    escalate: 'Call the medical officer if it is above 120 or below 40 at rest, or if it comes with chest pain, fainting or trouble breathing.',
    sources: ['mlPulse', 'hrpHazards'],
  },
  {
    id: 'bloodPressure', title: 'Blood pressure', indicators: ['systolic', 'diastolic'], hazard: 'Altered gravity',
    how: same([
      'Rest for 5 minutes first. Keep still and do not talk during the reading.',
      'Wrap the cuff around your bare upper arm, level with your heart.',
      'Start the cuff. Write down both numbers: the top one (systolic) and the bottom one (diastolic).',
    ]),
    why: 'Fluid shifts and changes in blood vessels during spaceflight affect blood pressure, and the heart and vessels adapt over months. Tracking it shows whether your circulation is coping, and it matters again when you return to gravity.',
    normal: 'Below 120 over 80. From 130 over 80 it is raised; 140 over 90 or more is high.',
    ifAbnormal: [
      'Rest for 5 minutes and measure again. Check the cuff is snug and at heart level.',
      'Cut back on salty food and keep up your exercise schedule.',
      'Measure daily at the same time for the next 3 days.',
    ],
    escalate: 'Report it if it stays at 140 over 90 or more. If it is higher than 180 over 120, wait 5 minutes and measure again. If it is still that high, or you have chest pain, shortness of breath, vision changes or trouble speaking, treat it as an emergency.',
    sources: ['ahaBp', 'hrpHazards'],
  },
  {
    id: 'spo2', title: 'Blood oxygen (SpO₂)', indicators: ['spo2'], hazard: 'Hostile closed environment',
    how: same([
      'Warm your hand and keep it still.',
      'Clip the pulse oximeter on a fingertip. Remove anything that covers the nail.',
      'Wait until the number is steady for 10 seconds, then record it.',
    ]),
    why: 'The crew breathes recycled air in a sealed cabin. A fault in life support, a build-up of carbon dioxide, or a lung problem can lower your oxygen before you feel it.',
    normal: '95% to 100%. A fingertip sensor can read a few points higher or lower than the true value.',
    ifAbnormal: [
      'Warm your finger, re-seat the sensor, try another finger and measure again.',
      'Sit upright and take slow, deep breaths.',
      'Check the cabin air readings and ask if anyone else feels headache, dizziness or shortness of breath.',
    ],
    escalate: 'At 92% or lower, or any reading with trouble breathing or blue lips: open the Emergency guide.',
    sources: ['mlSpo2', 'hrpHazards'],
  },
  {
    id: 'respRate', title: 'Breathing rate', indicators: ['respRate'], hazard: 'Hostile closed environment',
    how: same([
      'Sit or float still for 5 minutes, breathing normally. Do not try to control your breathing.',
      'The smart shirt counts it for you. By hand: a crewmate watches your chest rise for 30 seconds and doubles the count.',
    ]),
    why: 'Breathing rate goes up before oxygen drops when the body is short of air, for example from carbon dioxide building up in the cabin, a lung infection or a fever. It is one of the signals the Canadian Space Agency Bio-Monitor shirt records on the space station.',
    normal: '12 to 18 breaths per minute at rest.',
    ifAbnormal: [
      'Rest for 5 minutes and count again.',
      'Measure blood oxygen and temperature at the same time.',
      'Check the cabin carbon dioxide reading and ask whether anyone else has a headache or feels short of breath.',
    ],
    escalate: 'At 25 or more, or under 8, at rest, or with low oxygen, chest pain or confusion: open the Emergency guide for trouble breathing.',
    sources: ['mlVitals', 'csaBioMonitor', 'hrpHazards'],
  },
  {
    id: 'glucose', title: 'Blood sugar', indicators: ['glucose'], hazard: 'Altered gravity',
    how: same([
      'Measure in the morning before breakfast, at least 8 hours after your last meal.',
      'Wash and dry your hands, prick the side of a fingertip with the lancet and put one drop on the meter strip.',
      'Record the number in mg/dL. Capture the lancet and strip right away so nothing floats off.',
    ]),
    why: 'Muscles that carry less load use sugar less well. In a Canadian Space Agency study of 8 astronauts on 6-month missions, a measure of insulin resistance rose in flight. Low blood sugar is also a risk on long shifts and spacewalks, and it shows up as shakiness, sweating or confusion.',
    normal: '99 mg/dL or below when fasting, and not below 70.',
    ifAbnormal: [
      'Below 70: eat or drink 15 to 20 grams of fast sugar (juice, glucose tablets), wait 15 minutes and measure again. Repeat if still low.',
      'From 100: measure again tomorrow morning, fasting. Keep up resistance exercise and planned meals.',
      'Log what you ate the day before and how you slept.',
    ],
    escalate: 'Report a fasting value of 126 or more, or anything below 54. If someone is too confused to eat or drink, treat it as an emergency.',
    sources: ['cdcGlucose', 'niddkLow', 'hughson2016'],
  },
  {
    id: 'temperature', title: 'Body temperature', indicators: ['temperature'], hazard: 'Hostile closed environment',
    how: same([
      'Wait 15 minutes after eating, drinking or exercise.',
      'Use the thermometer as its instructions say (mouth, ear or forehead) and use the same method every time.',
    ]),
    why: 'Spaceflight changes how the immune system works, and viruses that were dormant in the body can become active again: in one NASA study, 61% of space station crew shed herpes viruses during their mission. In a sealed habitat an infection also spreads easily, so an early fever matters for the whole crew.',
    normal: '36.1 to 37.2 °C.',
    ifAbnormal: [
      'Measure again in 30 minutes.',
      'Drink fluids and rest.',
      'Log any other symptoms: sore throat, cough, rash, cold sores, aches.',
      'Keep some distance from crewmates and clean shared surfaces.',
    ],
    escalate: 'Report 38 °C or more, or a raised temperature that lasts more than 2 days.',
    sources: ['mlTemp', 'mlFever', 'rooney2019'],
  },
  {
    id: 'bodyMass', title: 'Body mass', indicators: ['bodyMass'], hazard: 'Altered gravity',
    how: (env) => [env.massMethod, 'Measure at the same time of day, once a week.'],
    why: 'Muscles and bones are loaded less in low gravity, so they shrink without countermeasures: space travelers lose about 1 to 1.5% of bone per month, and space station crew lost 2.8% of body mass on average in one NASA study. Bone density cannot be measured in flight, so falling body mass is a simple early warning.',
    normal: 'Steady, within about 2% of your baseline.',
    ifAbnormal: [
      'Measure again to rule out a bad reading.',
      'Check that you are eating all planned meals and log your food for 3 days.',
      'Do not skip resistance exercise sessions.',
    ],
    escalate: 'Report a loss of 5% or more from your baseline.',
    sources: ['zwart2014', 'boneMeta2020', 'hrpHazards'],
  },
  {
    id: 'sleep', title: 'Sleep', indicators: ['sleepHours'], hazard: 'Isolation and confinement',
    how: same(['Each morning, log how many hours you actually slept, not the time you spent in your sleep station.']),
    why: 'Noise, workload, and the loss of a normal day and night cycle make good sleep hard in space. NASA schedules 8.5 hours a night, but space station crew averaged only 6.1 hours in a 10-year study. Short sleep slows reaction time and judgment, which raises the chance of mistakes.',
    normal: '7 to 8 hours a night.',
    ifAbnormal: [
      'Keep the same sleep and wake times every day.',
      'Dim the lights and avoid screens for an hour before sleep. Use bright light in your morning.',
      'No caffeine in the 6 hours before sleep.',
    ],
    escalate: 'Tell the medical officer if you sleep less than 6 hours for 4 nights or more, or if tiredness is affecting your work.',
    sources: ['barger2014', 'hrpHazards'],
  },
  {
    id: 'mood', title: 'Mood, stress and fatigue', indicators: ['mood', 'stress', 'fatigue'], hazard: 'Isolation and confinement',
    how: same(['Once a day, rate each from 1 to 5. Answer quickly and honestly. There are no wrong answers, and it takes 10 seconds.']),
    why: 'Months in a small space with the same few people, far from home, wear on anyone. Low mood and high stress affect sleep, teamwork and decision-making, and they are easier to deal with when caught early.',
    normal: 'Close to your own usual scores. A single bad day is normal.',
    ifAbnormal: [
      'Protect your sleep, exercise and meal times first.',
      'Take your scheduled personal time, and contact family or friends if a link is available.',
      'Talk with a crewmate you trust.',
    ],
    escalate: 'Ask for a private conference with the flight surgeon or behavioral health team if scores stay low for a week, or at any time you feel unable to cope.',
    sources: ['hrpHazards', 'hrpRisks'],
  },
  {
    id: 'skin', title: 'Skin scan', indicators: [], tab: 'skin', hazard: 'Space radiation',
    how: same([
      'Ask a crewmate to take the photos, or use a mirror for areas you can reach.',
      'Use the same lighting, distance and pose each time, with the reference sticker in the frame for scale.',
      'Scan every body region once a week.',
    ]),
    why: 'Outside Earth\'s protective magnetic field the crew receives far more radiation, which raises cancer risk. Skin problems are also the most often reported medical complaint on the space station, and NASA\'s open data on mice flown in space (studies OSD-238 to OSD-254) show changes in genes for the skin barrier and collagen. Comparing photos over time catches a new or changing spot long before it would be noticed by eye.',
    normal: 'Spots that stay the same size, shape and color.',
    ifAbnormal: [
      'Re-scan the spot in good light to confirm the change.',
      'Do not scratch or pick at it. Keep it covered from sunlight through windows.',
      'Scan it again in 3 days and compare.',
    ],
    escalate: 'Send the photos to the flight surgeon if a spot is new and growing, larger than 6 mm, has an uneven edge or more than one color, or bleeds.',
    sources: ['aadAbcde', 'osdrSkin', 'skinPaper', 'crucian2016', 'hrpHazards'],
  },
  {
    id: 'vision', title: 'Vision check', indicators: ['nearVision', 'amsler'], tab: 'tests', hazard: 'Altered gravity',
    how: same([
      'Use the same screen every week, at arm\'s length (about 40 cm), in good light. Wear your reading glasses if you use them.',
      'Near-vision chart: the letter E points up, down, left or right. Tap the way it points. It gets smaller on every row.',
      'Amsler grid: cover one eye, look at the center dot, and say whether any lines look wavy, blurred, dark or missing. Then do the other eye.',
    ]),
    why: 'In weightlessness, body fluid shifts toward the head, and the back of the eye can swell and change shape. NASA calls this spaceflight associated neuro-ocular syndrome (SANS). About 70% of space station astronauts have some swelling at the back of their eyes, and in a survey of about 300 astronauts, around 60% of those on long missions said their distance and near vision got worse. A weekly check catches a change early.',
    normal: 'The same number of chart rows as your own baseline, give or take one, and a grid where every line looks straight and complete.',
    ifAbnormal: [
      'Repeat the test in good light, at the same distance, with your usual glasses.',
      'Test each eye on its own and note which one changed.',
      'If the mission supplied stronger or adjustable reading glasses, try them and note whether they help.',
    ],
    escalate: 'Report any wavy, blurred, dark or missing area on the grid the same day. Report a chart result that stays 2 rows or more below your baseline. Sudden loss of vision or eye pain is an emergency.',
    sources: ['nasaSans', 'mader2011', 'aaoAmsler'],
  },
  {
    id: 'reactionTime', title: 'Reaction time', indicators: ['reactionTime'], tab: 'tests', hazard: 'Isolation and confinement',
    how: same([
      'Sit still and use the same device and the same hand every time.',
      'When the circle turns green, tap it or press the space bar as fast as you can. Do not guess: a tap before green does not count.',
      'The test takes 5 tries and keeps the middle one as your result.',
    ]),
    why: 'Short or poor sleep slows your reactions before you notice that you are tired, and space station crew averaged only 6.1 hours of sleep a night in a 10-year study. Reaction-time tests are a standard way to measure this, and researchers validated a 3-minute version for astronauts to run on themselves. A slower result is a signal to take extra care with tasks where a mistake matters.',
    normal: 'Close to your own baseline on the same device. Results differ between devices, so do not compare with crewmates.',
    ifAbnormal: [
      'Rest for a minute and take the test again with no distractions.',
      'Look at your sleep over the last few nights and plan a full night tonight.',
      'Until it is back to normal, ask a crewmate to double-check safety-critical tasks.',
    ],
    escalate: 'Tell the medical officer if it stays 15% or more slower than your baseline for 3 days, or if it comes with confusion, a severe headache or a recent blow to the head.',
    sources: ['basner2011', 'barger2014'],
  },
  {
    id: 'symptoms', title: 'Symptoms', indicators: [], hazard: 'Hostile closed environment',
    how: same([
      'Once a day, tick anything you have noticed since your last check-in, even if it seems small.',
      'If you feel fine, save "No symptoms today" so the record shows that you checked.',
    ]),
    why: 'Small symptoms carry more weight in space. Spaceflight changes how the immune system works: skin rashes are the most often reported medical complaint on the space station, and in one NASA study 61% of crew shed reactivated herpes viruses, the kind that cause cold sores. Moving between gravity levels also affects balance and can cause motion sickness. In a sealed habitat an infection spreads easily to the rest of the crew.',
    normal: 'No symptoms, or a mild one that is gone the next day.',
    ifAbnormal: [
      'Log it every day until it is gone, so the record shows how long it lasted.',
      'Take the measurement that goes with it: temperature for fever or a sore throat, a skin scan for a rash, the vision check for blurred vision, the reaction test for trouble concentrating.',
      'Rest and drink fluids. If it could be an infection, keep some distance from crewmates and clean shared surfaces.',
    ],
    escalate: 'Chest pain, trouble breathing or fainting: call the medical officer now. Report any symptom that lasts 3 days or more, or that is getting worse.',
    sources: ['crucian2016', 'rooney2019', 'hrpHazards'],
  },
];

export const guideFor = (indicator: IndicatorId): Guide | undefined => GUIDES.find((g) => g.indicators.includes(indicator));
