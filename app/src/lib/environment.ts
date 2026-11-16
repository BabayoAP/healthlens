/**
 * Mission environments (PRD §6). One setting changes instructions, emergency guidance and comm expectations.
 * Signal delays are the light travel time for the distance: the Moon is about 384,000 km away
 * (1.3 s); Mars is about 55 to 400 million km away (3 to 22 minutes one way, up to 44 minutes for
 * a question and its answer). Gravity: Moon 0.17 g, Mars 0.38 g. Shelter advice follows NASA's
 * public description of the Orion storm-shelter procedure (see `sources.ts`: nasaShelter).
 */
import type { BodySystem } from './types';

export type EnvironmentId = 'station' | 'spacecraft' | 'moon' | 'rover' | 'mars';

export interface Environment {
  id: EnvironmentId;
  label: string;
  gravity: string;
  /** One-way signal delay to Earth, in words */
  commDelay: string;
  /** Can the crew have a live conversation with flight surgeons? */
  liveHelp: boolean;
  /** What to tell the crew about getting help from the ground */
  helpAdvice: string;
  /** How to measure body mass here */
  massMethod: string;
  /** Where to go in a radiation event */
  shelter: string;
  /** Health topics that matter most here */
  focus: string[];
  /** Short name for tight spaces */
  short: string;
  /** Where this is, in one line */
  where: string;
  /** Signal delay right now, when it changes with the mission (labeled estimated) */
  delayNow?: string;
  /** Measurement guides (`guides.ts` ids) that matter most here, shown first and tagged */
  keyChecks: string[];
  /** Checks that can't be done here (no equipment), left out of reminders */
  skipChecks?: string[];
  /** Emergency guides (`emergency.ts` ids) most likely here, tagged on the Emergency screen */
  likelyEmergencies: string[];
  /** What this place does to a body system, shown on the Body map */
  systemNotes: Partial<Record<BodySystem, string>>;
}

export const ENVIRONMENTS: Environment[] = [
  {
    id: 'station', label: 'Space station (low Earth orbit)', gravity: 'Microgravity',
    commDelay: 'under 1 second', liveHelp: true,
    helpAdvice: 'Call the flight surgeon now. You can talk live.',
    massMethod: 'A scale does not work in microgravity. Use the mass-measuring device, which pushes you with a known force and works out your mass from how fast you accelerate.',
    shelter: 'Move to the most shielded module of the station.',
    focus: ['Vision changes', 'Heart and circulation', 'Bone and muscle loss'],
    short: 'Space station', where: 'In low Earth orbit, about 400 km up. A crew return to Earth takes hours.',
    keyChecks: ['vision', 'bloodPressure', 'heartRate', 'bodyMass'],
    likelyEmergencies: ['toxic-air', 'decompression', 'eye-injury', 'low-oxygen'],
    systemNotes: {
      cardiovascular: 'Here: weightlessness shifts about 2 liters of fluid toward the head, so the heart works less and slowly deconditions.',
      vision: 'Here: the same fluid shift presses on the back of the eye. Most station crews show some swelling there (SANS).',
      musculoskeletal: 'Here: nothing loads the bones and muscles unless you exercise, about 2 hours a day on the station.',
      behavioral: 'Here: 16 sunrises a day and a busy schedule make steady sleep hard.',
    },
  },
  {
    id: 'spacecraft', label: 'Spacecraft on the way to Mars', gravity: 'Microgravity',
    commDelay: 'grows with distance, up to about 22 minutes', liveHelp: false,
    helpAdvice: 'Send a report to the flight surgeon now, then keep going with the steps. A reply can take up to 44 minutes.',
    massMethod: 'A scale does not work in microgravity. Use the mass-measuring device.',
    shelter: 'Build the storm shelter: move to the most shielded area and stack stowage and water around the crew.',
    focus: ['Radiation', 'Bone and muscle loss', 'Mood and sleep'],
    short: 'Spacecraft to Mars', where: 'In deep space, about halfway to Mars. There is no way to turn back or send help.',
    delayNow: 'about 5 minutes each way today (estimated for mission day 142, about halfway to Mars)',
    keyChecks: ['skin', 'mood', 'sleep', 'bodyMass'],
    likelyEmergencies: ['solar-storm', 'chest-pain', 'cardiac-arrest', 'mental-crisis'],
    systemNotes: {
      skin: 'Here: outside Earth\'s magnetic field, galactic cosmic rays and solar storms reach the crew. A Mars round trip alone is about 0.66 sievert.',
      musculoskeletal: 'Here: months of weightlessness before landing. Bone and muscle lost now must carry you on Mars.',
      behavioral: 'Here: a small crew, far from home, with delayed calls. Mood and sleep are early warnings.',
      cardiovascular: 'Here: weightlessness deconditions the heart and vessels, which matters when you stand up again on Mars.',
    },
  },
  {
    id: 'moon', label: 'Moon base', gravity: '1/6 of Earth gravity',
    commDelay: 'about 1.3 seconds', liveHelp: true,
    helpAdvice: 'Call the flight surgeon now. You can talk live, with a short lag.',
    massMethod: 'An Earth scale reads about one sixth of your real weight here. Enter the reading multiplied by 6, or use a scale set for lunar gravity.',
    shelter: 'Get inside the habitat or the nearest shielded shelter. If you are in a rover or on a moonwalk, head back now.',
    focus: ['Radiation', 'Lunar dust on skin, eyes and lungs', 'Injuries'],
    short: 'Moon base', where: 'On the lunar surface. Earth is about 3 days away.',
    keyChecks: ['skin', 'spo2', 'respRate', 'symptoms'],
    likelyEmergencies: ['eye-injury', 'toxic-air', 'head-injury', 'solar-storm'],
    systemNotes: {
      skin: 'Here: lunar dust is sharp and clings to suits, skin and eyes, and there is no atmosphere or magnetic field to stop radiation.',
      cardiovascular: 'Here: dust carried into the habitat can irritate the lungs. Watch breathing rate and blood oxygen.',
      vision: 'Here: dust scratches the eyes easily. Flush, do not rub.',
      musculoskeletal: 'Here: 1/6 of Earth gravity still loads bones and muscles far less than on Earth.',
    },
  },
  {
    id: 'rover', label: 'Pressurized rover (Moon)', gravity: '1/6 of Earth gravity',
    commDelay: 'about 1.3 seconds (drops out behind hills)', liveHelp: true,
    helpAdvice: 'Call the flight surgeon now through the base relay. If the link drops, keep going with the steps and send a report when it is back.',
    massMethod: 'There is no mass-measuring device in the rover. Skip body mass on a rover trip and weigh yourself at the base.',
    shelter: 'Head back to the habitat now. If you cannot get there in time, park, stay in the cabin and put the crew in the middle, with water and stowage packed around you.',
    focus: ['Radiation far from shelter', 'Dust', 'Injuries', 'Fatigue on long drives'],
    short: 'Lunar rover', where: 'In a pressurized rover on the Moon, hours from the base.',
    keyChecks: ['reactionTime', 'sleep', 'skin', 'glucose'],
    skipChecks: ['bodyMass'],
    likelyEmergencies: ['solar-storm', 'head-injury', 'low-sugar', 'decompression'],
    systemNotes: {
      behavioral: 'Here: long drives on rough ground are tiring. Check reaction time before driving or a moonwalk.',
      skin: 'Here: the rover cabin shields less than the base. In a solar storm, every minute of driving counts.',
      metabolic: 'Here: long shifts and moonwalks can drop blood sugar. Carry snacks.',
    },
  },
  {
    id: 'mars', label: 'Mars base', gravity: 'About 3/8 of Earth gravity',
    commDelay: '3 to 22 minutes', liveHelp: false,
    helpAdvice: 'Send a report to the flight surgeon now, then keep going with the steps. A reply can take up to 44 minutes, so the crew acts first.',
    massMethod: 'An Earth scale reads about 38% of your real weight here. Divide the reading by 0.38, or use a scale set for Mars gravity.',
    shelter: 'Get inside the habitat or the nearest shielded shelter. If you are in a rover or outside, head back now.',
    focus: ['Radiation', 'Dust exposure', 'Mood and isolation', 'Injuries'],
    short: 'Mars base', where: 'On the surface of Mars. Earth is months away, and help is a message, not a call.',
    keyChecks: ['mood', 'sleep', 'skin', 'bloodPressure'],
    likelyEmergencies: ['chest-pain', 'cardiac-arrest', 'fainting', 'mental-crisis'],
    systemNotes: {
      cardiovascular: 'Here: after months of weightlessness, standing in 0.38 g can make you dizzy or faint at first.',
      musculoskeletal: 'Here: 3/8 of Earth gravity. Bones weakened on the way are at higher risk of fracture.',
      behavioral: 'Here: up to 44 minutes for a question and its answer. Isolation is the main hazard.',
      skin: 'Here: thin air and no magnetic field let more radiation reach the surface. Dust is fine and gets everywhere.',
    },
  },
];

export const environmentById = Object.fromEntries(ENVIRONMENTS.map((e) => [e.id, e])) as Record<EnvironmentId, Environment>;
