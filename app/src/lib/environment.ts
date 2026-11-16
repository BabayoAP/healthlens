/**
 * Mission environments (PRD §6). One setting changes instructions, emergency guidance and comm expectations.
 * Signal delays are the light travel time for the distance: the Moon is about 384,000 km away
 * (1.3 s); Mars is about 55 to 400 million km away (3 to 22 minutes one way, up to 44 minutes for
 * a question and its answer). Gravity: Moon 0.17 g, Mars 0.38 g. Shelter advice follows NASA's
 * public description of the Orion storm-shelter procedure (see `sources.ts`: nasaShelter).
 */
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
}

export const ENVIRONMENTS: Environment[] = [
  {
    id: 'station', label: 'Space station (low Earth orbit)', gravity: 'Microgravity',
    commDelay: 'under 1 second', liveHelp: true,
    helpAdvice: 'Call the flight surgeon now. You can talk live.',
    massMethod: 'A scale does not work in microgravity. Use the mass-measuring device, which pushes you with a known force and works out your mass from how fast you accelerate.',
    shelter: 'Move to the most shielded module of the station.',
    focus: ['Vision changes', 'Heart and circulation', 'Bone and muscle loss'],
  },
  {
    id: 'spacecraft', label: 'Spacecraft (deep-space transit)', gravity: 'Microgravity',
    commDelay: 'grows with distance, up to about 22 minutes', liveHelp: false,
    helpAdvice: 'Send a report to the flight surgeon now, then keep going with the steps. A reply can take up to 44 minutes.',
    massMethod: 'A scale does not work in microgravity. Use the mass-measuring device.',
    shelter: 'Build the storm shelter: move to the most shielded area and stack stowage and water around the crew.',
    focus: ['Radiation', 'Bone and muscle loss', 'Mood and sleep'],
  },
  {
    id: 'moon', label: 'Moon base', gravity: '1/6 of Earth gravity',
    commDelay: 'about 1.3 seconds', liveHelp: true,
    helpAdvice: 'Call the flight surgeon now. You can talk live, with a short lag.',
    massMethod: 'An Earth scale reads about one sixth of your real weight here. Enter the reading multiplied by 6, or use a scale set for lunar gravity.',
    shelter: 'Get inside the habitat or the nearest shielded shelter. If you are in a rover or on a moonwalk, head back now.',
    focus: ['Radiation', 'Lunar dust on skin, eyes and lungs', 'Injuries'],
  },
  {
    id: 'rover', label: 'Pressurized rover (Moon)', gravity: '1/6 of Earth gravity',
    commDelay: 'about 1.3 seconds, with dropouts behind hills and craters', liveHelp: true,
    helpAdvice: 'Call the flight surgeon now through the base relay. If the link drops, keep going with the steps and send a report when it is back.',
    massMethod: 'There is no mass-measuring device in the rover. Skip body mass on a rover trip and weigh yourself at the base.',
    shelter: 'Head back to the habitat now. If you cannot get there in time, park, stay in the cabin and put the crew in the middle, with water and stowage packed around you.',
    focus: ['Radiation far from shelter', 'Dust', 'Injuries', 'Fatigue on long drives'],
  },
  {
    id: 'mars', label: 'Mars base', gravity: 'About 3/8 of Earth gravity',
    commDelay: '3 to 22 minutes', liveHelp: false,
    helpAdvice: 'Send a report to the flight surgeon now, then keep going with the steps. A reply can take up to 44 minutes, so the crew acts first.',
    massMethod: 'An Earth scale reads about 38% of your real weight here. Divide the reading by 0.38, or use a scale set for Mars gravity.',
    shelter: 'Get inside the habitat or the nearest shielded shelter. If you are in a rover or outside, head back now.',
    focus: ['Radiation', 'Dust exposure', 'Mood and isolation', 'Injuries'],
  },
];

export const environmentById = Object.fromEntries(ENVIRONMENTS.map((e) => [e.id, e])) as Record<EnvironmentId, Environment>;
