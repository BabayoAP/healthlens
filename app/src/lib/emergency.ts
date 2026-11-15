import type { Environment } from './environment';

/**
 * Emergency guides (PRD §5.13). One short step per screen.
 *
 * REFERENCE CONTENT for the hackathon demo, based on general first-aid practice and public
 * NASA descriptions of radiation-event procedures. Not reviewed by a clinician and not a
 * replacement for mission medical procedures.
 */
export interface EmergencyStep {
  title: string;
  detail: string;
  /** Something to measure and write down during this step */
  log?: string;
}

export interface EmergencyGuide {
  id: string;
  title: string;
  /** When to use this guide */
  when: string;
  steps: (env: Environment) => EmergencyStep[];
}

export const EMERGENCY_GUIDES: EmergencyGuide[] = [
  {
    id: 'low-oxygen',
    title: 'Low oxygen or trouble breathing',
    when: 'SpO₂ below 92%, shortness of breath, blue lips, or confusion.',
    steps: (env) => [
      { title: 'Stop and get help', detail: 'Stop what you are doing. Call a crewmate to stay with you. Do not stay alone.' },
      { title: 'Sit upright', detail: 'Sit or hold yourself upright. Loosen tight clothing. Breathe slowly in through the nose and out through the mouth.' },
      { title: 'Check the reading', detail: 'Warm the finger, re-seat the oximeter and measure again on another finger.', log: 'SpO₂ and heart rate, with the time' },
      { title: 'Check the air', detail: 'Look at the cabin oxygen and carbon dioxide readings. Ask whether anyone else has a headache, dizziness or shortness of breath. If the air is the problem, move everyone to a different module or area and follow the air-quality alarm procedure.' },
      { title: 'Give oxygen', detail: 'If SpO₂ is still below 92%, give oxygen from the medical kit as its instructions say.' },
      { title: 'Contact the flight surgeon', detail: env.helpAdvice },
      { title: 'Keep monitoring', detail: 'Measure every 5 minutes until SpO₂ is 95% or more for 30 minutes. If the person becomes unresponsive, start the crew\'s life-support procedure.', log: 'SpO₂, heart rate and breathing rate every 5 minutes' },
    ],
  },
  {
    id: 'solar-storm',
    title: 'Solar particle event (radiation storm)',
    when: 'A solar storm alert from mission control or space-weather monitoring, or a dosimeter alarm.',
    steps: (env) => [
      { title: 'Alert the whole crew', detail: 'Tell everyone now. Stop non-essential work.' },
      { title: 'Take shelter', detail: env.shelter },
      { title: 'Bring what you need', detail: 'Take your personal dosimeter, water, food, the medical kit and a way to communicate. You may be there for hours.' },
      { title: 'Log your dose', detail: 'Read your dosimeter when you enter the shelter and every 30 minutes.', log: 'Dosimeter reading and time, for each crew member' },
      { title: 'Contact mission control', detail: `${env.helpAdvice} Ask for the expected length of the storm.` },
      { title: 'Stay until all-clear', detail: 'Stay sheltered until mission control or the radiation monitor confirms the storm has passed. Storms can last from hours to a couple of days.' },
      { title: 'Afterwards', detail: 'Log the total dose. For the next 2 weeks, check in daily and watch for nausea, unusual tiredness or reddened skin. Do a full skin scan this week.', log: 'Total dose for the event' },
    ],
  },
];
