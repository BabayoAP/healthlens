import type { Astronaut, IndicatorId, Reading, SkinScan } from './types';

/**
 * Demo crew + seeded history (PRD §5.0, §5.10). Everything generated here is tagged `simulated`.
 *
 * Each astronaut has 6 weeks of data: a steady personal baseline with small day-to-day noise,
 * plus ONE planned problem so the demo has something to find:
 *   a1 Vega      — skin: a spot on the left arm grows between mission day 97 and day 142  → Act
 *   a2 Osei      — blood pressure creeps up over the last 2 weeks                         → Watch
 *   a3 Lindqvist — nothing wrong (the healthy contrast)                                   → OK
 *   a4 Nakamura  — resting HR and sleep drift slowly while every value still looks
 *                  "normal" (sustained-trend rule), and temperature checks were skipped   → Watch.
 *                  Reaction time slows over the same days as the sleep loss.
 *
 * TODO: shape the trends on published findings (NASA Twins Study) so they can be cited.
 */

export const crew: Astronaut[] = [
  { id: 'a1', name: 'Cmdr. R. Vega', role: 'Commander', missionDay: 142, radiationMSv: 71, body: 'female' },
  { id: 'a2', name: 'Dr. K. Osei', role: 'Flight Engineer', missionDay: 142, radiationMSv: 68, body: 'male' },
  { id: 'a3', name: 'M. Lindqvist', role: 'Mission Specialist', missionDay: 142, radiationMSv: 70, body: 'female' },
  { id: 'a4', name: 'T. Nakamura', role: 'Pilot', missionDay: 142, radiationMSv: 69, body: 'male' },
];

const DAY = 86_400_000;
const HISTORY_DAYS = 42;

/** Deterministic noise in [-1, 1], so the demo data is the same on every machine and every day. */
function noise(key: string, daysAgo: number): number {
  let h = 2166136261;
  const s = `${key}:${daysAgo}`;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

interface Series {
  indicator: IndicatorId;
  base: number;
  /** Max day-to-day wobble (± this much) */
  wobble: number;
  decimals: number;
  everyDays?: number;
  /** Planned problem: a steady drift of `perDay` over the last `lastDays` days */
  drift?: { perDay: number; lastDays: number };
  /** Planned problem: no readings in the last N days */
  missingLastDays?: number;
}

const healthy = (hr: number, sys: number, dia: number, mass: number): Series[] => [
  { indicator: 'heartRate', base: hr, wobble: 2, decimals: 0 },
  { indicator: 'systolic', base: sys, wobble: 3, decimals: 0 },
  { indicator: 'diastolic', base: dia, wobble: 2, decimals: 0 },
  { indicator: 'spo2', base: 97.5, wobble: 1, decimals: 0 },
  { indicator: 'temperature', base: 36.6, wobble: 0.2, decimals: 1 },
  { indicator: 'bodyMass', base: mass, wobble: 0.3, decimals: 1, everyDays: 7 },
  { indicator: 'sleepHours', base: 7.4, wobble: 0.4, decimals: 1 },
  { indicator: 'mood', base: 4, wobble: 0.7, decimals: 0 },
  { indicator: 'stress', base: 2, wobble: 0.7, decimals: 0 },
  { indicator: 'fatigue', base: 2, wobble: 0.7, decimals: 0 },
  { indicator: 'reactionTime', base: 250 + hr, wobble: 9, decimals: 0 },
  { indicator: 'nearVision', base: 7, wobble: 0.4, decimals: 0, everyDays: 7 },
  { indicator: 'amsler', base: 0, wobble: 0, decimals: 0, everyDays: 7 },
  { indicator: 'respRate', base: 14, wobble: 1, decimals: 0 },
  { indicator: 'glucose', base: 84 + (hr % 7), wobble: 5, decimals: 0, everyDays: 7 },
];

const withProblem = (series: Series[], changes: Partial<Record<IndicatorId, Partial<Series>>>): Series[] =>
  series.map((s) => ({ ...s, ...changes[s.indicator] }));

const plans: Record<string, Series[]> = {
  a1: healthy(64, 117, 73, 78.2),
  a2: withProblem(healthy(69, 120, 73, 84.5), {
    systolic: { drift: { perDay: 1.1, lastDays: 14 }, wobble: 2 },
    diastolic: { drift: { perDay: 0.5, lastDays: 14 } },
  }),
  a3: healthy(60, 112, 70, 66.8),
  a4: withProblem(healthy(62, 115, 72, 71.4), {
    heartRate: { drift: { perDay: 0.6, lastDays: 12 } },
    sleepHours: { drift: { perDay: -0.12, lastDays: 10 }, wobble: 0.25 },
    temperature: { missingLastDays: 5 },
    reactionTime: { drift: { perDay: 2.6, lastDays: 10 }, wobble: 6 },
  }),
};

function seedReadings(now: number): Reading[] {
  const out: Reading[] = [];
  for (const [astronautId, series] of Object.entries(plans)) {
    for (const s of series) {
      for (let daysAgo = HISTORY_DAYS - 1; daysAgo >= (s.missingLastDays ?? 0); daysAgo--) {
        if (s.everyDays && daysAgo % s.everyDays !== 0) continue;
        const driftDays = s.drift ? Math.max(0, s.drift.lastDays - daysAgo) : 0;
        const raw = s.base + (s.drift?.perDay ?? 0) * driftDays + noise(`${astronautId}:${s.indicator}`, daysAgo) * s.wobble;
        const f = 10 ** s.decimals;
        out.push({
          id: `seed-${astronautId}-${s.indicator}-${daysAgo}`,
          astronautId,
          indicator: s.indicator,
          takenAt: new Date(now - daysAgo * DAY - 3_600_000).toISOString(),
          value: Math.round(raw * f) / f,
          source: 'simulated',
        });
      }
    }
  }
  return out;
}

function seedSkinScans(now: number): SkinScan[] {
  const at = (daysAgo: number) => new Date(now - daysAgo * DAY - 3_600_000).toISOString();
  return [
    // The worked example (PRD §12): the same two spots, 45 days apart.
    {
      id: 'seed-scan-a1-1', astronautId: 'a1', region: 'left-arm', takenAt: at(45), source: 'simulated',
      lesions: [
        { id: 'a1-arm-1', x: 0.32, y: 0.4, diameterMm: 3, color: 'brown', notes: ['symmetric', 'even border'], risk: 'ok', change: 'stable' },
        { id: 'a1-arm-2', x: 0.61, y: 0.55, diameterMm: 4, color: 'brown', notes: ['new since last scan', 'even border'], risk: 'watch', change: 'new' },
      ],
    },
    {
      id: 'seed-scan-a1-2', astronautId: 'a1', region: 'left-arm', takenAt: at(0), source: 'simulated',
      lesions: [
        { id: 'a1-arm-1', x: 0.32, y: 0.4, diameterMm: 3, color: 'brown', notes: ['symmetric', 'even border'], risk: 'ok', change: 'stable' },
        { id: 'a1-arm-2', x: 0.61, y: 0.55, diameterMm: 6.5, color: 'dark brown / black',
          notes: ['grew 2.5 mm in 45 days', 'now over 6 mm', 'border became irregular', 'two colors'], risk: 'act', change: 'changed' },
      ],
    },
    {
      id: 'seed-scan-a2-1', astronautId: 'a2', region: 'upper-back', takenAt: at(6), source: 'simulated',
      lesions: [{ id: 'a2-back-1', x: 0.4, y: 0.3, diameterMm: 3, color: 'brown', notes: ['symmetric', 'even border'], risk: 'ok', change: 'stable' }],
    },
  ];
}

export function generateSeed(now: number): { readings: Reading[]; skinScans: SkinScan[] } {
  return { readings: seedReadings(now), skinScans: seedSkinScans(now) };
}
