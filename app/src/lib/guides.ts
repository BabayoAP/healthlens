import type { Environment } from './environment';
import type { IndicatorId } from './types';

/**
 * Measurement guides (PRD §5.12): how to measure, why it matters in space, what to do if it looks wrong.
 * Written for people who are not doctors.
 *
 * REFERENCE CONTENT for the hackathon demo: general first-aid and health-monitoring practice plus
 * NASA Human Research Program hazard descriptions. Not reviewed by a clinician.
 * TODO: check each "why" claim against a NASA source and list it in docs/SUBMISSION.md.
 */
export interface Guide {
  id: string;
  title: string;
  /** Indicators this guide covers (empty for skin, which is not a numeric indicator) */
  indicators: IndicatorId[];
  /** Which of NASA's five spaceflight hazards this relates to */
  hazard: string;
  how: (env: Environment) => string[];
  why: string;
  normal: string;
  ifAbnormal: string[];
  /** When to bring in the medical officer / flight surgeon */
  escalate: string;
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
    normal: '60 to 100 beats per minute for most adults; fit crew are often lower. What matters most is your own baseline.',
    ifAbnormal: [
      'Rest for 5 more minutes and measure again.',
      'Drink water, and think about last night\'s sleep, recent exercise and caffeine.',
      'If it is still 10 or more above your baseline, measure morning and evening for 3 days.',
    ],
    escalate: 'Call the medical officer if it is above 120 or below 40 at rest, or if it comes with chest pain, fainting or trouble breathing.',
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
    escalate: 'Report it if it stays at 140 over 90 or more. Treat 180 over 120 or more, or a high reading with headache, chest pain or vision changes, as an emergency.',
  },
  {
    id: 'spo2', title: 'Blood oxygen (SpO₂)', indicators: ['spo2'], hazard: 'Hostile closed environment',
    how: same([
      'Warm your hand and keep it still.',
      'Clip the pulse oximeter on a fingertip. Remove anything that covers the nail.',
      'Wait until the number is steady for 10 seconds, then record it.',
    ]),
    why: 'The crew breathes recycled air in a sealed cabin. A fault in life support, a build-up of carbon dioxide, or a lung problem can lower your oxygen before you feel it.',
    normal: '95% to 100%.',
    ifAbnormal: [
      'Warm your finger, re-seat the sensor, try another finger and measure again.',
      'Sit upright and take slow, deep breaths.',
      'Check the cabin air readings and ask if anyone else feels headache, dizziness or shortness of breath.',
    ],
    escalate: 'Below 92%, or any reading with trouble breathing or blue lips: open the Emergency guide.',
  },
  {
    id: 'temperature', title: 'Body temperature', indicators: ['temperature'], hazard: 'Hostile closed environment',
    how: same([
      'Wait 15 minutes after eating, drinking or exercise.',
      'Use the thermometer as its instructions say (mouth, ear or forehead) and use the same method every time.',
    ]),
    why: 'Spaceflight changes how the immune system works, and viruses that were dormant in the body can become active again. In a sealed habitat an infection also spreads easily, so an early fever matters for the whole crew.',
    normal: '36.1 to 37.2 °C.',
    ifAbnormal: [
      'Measure again in 30 minutes.',
      'Drink fluids and rest.',
      'Log any other symptoms: sore throat, cough, rash, cold sores, aches.',
      'Keep some distance from crewmates and clean shared surfaces.',
    ],
    escalate: 'Report 38 °C or more, or a raised temperature that lasts more than 2 days.',
  },
  {
    id: 'bodyMass', title: 'Body mass', indicators: ['bodyMass'], hazard: 'Altered gravity',
    how: (env) => [env.massMethod, 'Measure at the same time of day, once a week.'],
    why: 'Muscles and bones are loaded less in low gravity, so they shrink without countermeasures, and many crew eat less than they need. Falling body mass is a simple early warning for both.',
    normal: 'Steady, within about 2% of your baseline.',
    ifAbnormal: [
      'Measure again to rule out a bad reading.',
      'Check that you are eating all planned meals and log your food for 3 days.',
      'Do not skip resistance exercise sessions.',
    ],
    escalate: 'Report a loss of 5% or more from your baseline.',
  },
  {
    id: 'sleep', title: 'Sleep', indicators: ['sleepHours'], hazard: 'Isolation and confinement',
    how: same(['Each morning, log how many hours you actually slept, not the time you spent in your sleep station.']),
    why: 'Noise, workload, and the loss of a normal day and night cycle make good sleep hard in space. Short sleep slows reaction time and judgment, which raises the chance of mistakes.',
    normal: '7 to 8 hours a night.',
    ifAbnormal: [
      'Keep the same sleep and wake times every day.',
      'Dim the lights and avoid screens for an hour before sleep. Use bright light in your morning.',
      'No caffeine in the 6 hours before sleep.',
    ],
    escalate: 'Tell the medical officer if you sleep less than 6 hours for 4 nights or more, or if tiredness is affecting your work.',
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
  },
  {
    id: 'skin', title: 'Skin scan', indicators: [], hazard: 'Space radiation',
    how: same([
      'Ask a crewmate to take the photos, or use a mirror for areas you can reach.',
      'Use the same lighting, distance and pose each time, with the reference sticker in the frame for scale.',
      'Scan every body region once a week.',
    ]),
    why: 'Outside Earth\'s protective magnetic field the crew receives far more radiation, which raises cancer risk. Skin also gets drier and more easily irritated in flight. Comparing photos over time catches a new or changing spot long before it would be noticed by eye.',
    normal: 'Spots that stay the same size, shape and color.',
    ifAbnormal: [
      'Re-scan the spot in good light to confirm the change.',
      'Do not scratch or pick at it. Keep it covered from sunlight through windows.',
      'Scan it again in 3 days and compare.',
    ],
    escalate: 'Send the photos to the flight surgeon if a spot is new and growing, larger than 6 mm, has an uneven edge or more than one color, or bleeds.',
  },
];

export const guideFor = (indicator: IndicatorId): Guide | undefined => GUIDES.find((g) => g.indicators.includes(indicator));
