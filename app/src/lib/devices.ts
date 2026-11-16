import type { Environment } from './environment';
import { indicatorById } from './indicators';
import type { SourceId } from './sources';
import type { IndicatorId, Reading } from './types';

/**
 * Connected devices (PRD §5.0, `device` input). SIMULATED: no real hardware is connected.
 * Each device is modeled on equipment space agencies use to monitor crews, so the import flow
 * matches what a crew would really do. Readings are saved with source `simulated` plus the device id,
 * so they are never shown as real measurements.
 */
export interface DeviceDef {
  id: string;
  /** Short name, shown next to imported values */
  name: string;
  /** The real space hardware this one is modeled on */
  basedOn: string;
  /** What the crew member does before syncing */
  session: string;
  measures: IndicatorId[];
  sources: SourceId[];
  /** Why the device can't be used here, if it can't */
  unavailable?: (env: Environment) => string | undefined;
  /** Device name when it depends on where the crew is */
  nameFor?: (env: Environment) => string;
}

export const DEVICES: DeviceDef[] = [
  {
    id: 'bioMonitor', name: 'Smart shirt',
    basedOn: 'Canadian Space Agency Bio-Monitor: a smart shirt and headband on the space station since 2019 that records heart rate and ECG, blood pressure, breathing rate, blood oxygen, skin temperature and activity.',
    session: 'Put on the shirt and headband, rest for 5 minutes, then sync.',
    measures: ['heartRate', 'systolic', 'diastolic', 'spo2', 'respRate'],
    sources: ['csaBioMonitor'],
  },
  {
    id: 'actigraph', name: 'Sleep wristband',
    basedOn: 'The Actiwatch worn in NASA\'s Sleep-Long study: a wrist device whose motion sensor tells sleep from wake. Its data led to changes in crew schedules on the space station.',
    session: 'Wear it overnight. Syncing reads last night\'s sleep.',
    measures: ['sleepHours'],
    sources: ['nasaSleepLong', 'barger2014'],
  },
  {
    id: 'massDevice', name: 'Body mass device',
    nameFor: (env) => (env.id === 'station' || env.id === 'spacecraft' ? 'Body mass device' : 'Gravity-corrected scale'),
    basedOn: 'SLAMMD on the space station: a scale cannot work in weightlessness, so it pushes the crew member with springs and works out mass from the acceleration. On the Moon or Mars, a scale corrected for local gravity.',
    session: 'Weekly, at the same time of day.',
    measures: ['bodyMass'],
    sources: ['zwart2014'],
    unavailable: (env) => (env.id === 'rover' ? 'Not carried on the rover. Weigh in at the base.' : undefined),
  },
  {
    id: 'bloodAnalyzer', name: 'Blood analyzer',
    basedOn: 'Like the Canadian Space Agency\'s Bio-Analyzer, which tests a few drops of blood from a finger prick in orbit instead of freezing samples to fly home months later.',
    session: 'Weekly, before breakfast: one drop from a finger prick.',
    measures: ['glucose'],
    sources: ['csaBioAnalyzer', 'hughson2016'],
  },
  {
    id: 'thermometer', name: 'Ear thermometer',
    basedOn: 'A standard clinical ear thermometer with a wireless link.',
    session: 'One reading in the ear, the same ear every time.',
    measures: ['temperature'],
    sources: ['mlTemp'],
  },
];

export const deviceById = Object.fromEntries(DEVICES.map((d) => [d.id, d])) as Record<string, DeviceDef>;

export const deviceName = (d: DeviceDef, env: Environment) => d.nameFor?.(env) ?? d.name;

/** How far a simulated reading strays from the person's recent values (± this much) */
const WOBBLE: Partial<Record<IndicatorId, number>> = {
  heartRate: 3, systolic: 4, diastolic: 3, spo2: 1, respRate: 1, sleepHours: 0.4, bodyMass: 0.3, glucose: 5, temperature: 0.2,
};
/** Used when the person has no history yet */
const TYPICAL: Partial<Record<IndicatorId, number>> = {
  heartRate: 64, systolic: 118, diastolic: 74, spo2: 98, respRate: 14, sleepHours: 7.3, bodyMass: 75, glucose: 88, temperature: 36.6,
};
/** Keeps a simulated value physically possible */
const RANGE: Partial<Record<IndicatorId, [number, number]>> = { spo2: [80, 100], sleepHours: [0, 12] };

/**
 * One simulated sync: a reading for each indicator the device measures, close to the mean of this
 * person's last 3 readings, so imported values continue their own story. `random` is injectable for tests.
 */
export function simulateSync(
  device: DeviceDef, astronautId: string, readings: Reading[], now: number, random: () => number = Math.random,
): Omit<Reading, 'id'>[] {
  const takenAt = new Date(now).toISOString();
  const out: Omit<Reading, 'id'>[] = device.measures.map((id) => {
    const recent = readings.filter((r) => r.astronautId === astronautId && r.indicator === id)
      .sort((a, b) => a.takenAt.localeCompare(b.takenAt)).slice(-3);
    const around = recent.length ? recent.reduce((s, r) => s + r.value, 0) / recent.length : TYPICAL[id] ?? 0;
    const [lo, hi] = RANGE[id] ?? [-Infinity, Infinity];
    const f = 10 ** indicatorById[id].decimals;
    const value = Math.min(hi, Math.max(lo, Math.round((around + (random() * 2 - 1) * (WOBBLE[id] ?? 0)) * f) / f));
    return { astronautId, indicator: id, value, takenAt, source: 'simulated', device: device.id };
  });
  // Blood pressure: the bottom number must stay below the top one
  const sys = out.find((r) => r.indicator === 'systolic');
  const dia = out.find((r) => r.indicator === 'diastolic');
  if (sys && dia && dia.value >= sys.value) dia.value = sys.value - 30;
  return out;
}

/** When this device last synced for this person, or undefined if never */
export function lastSync(deviceId: string, astronautId: string, readings: Reading[]): string | undefined {
  let last: string | undefined;
  for (const r of readings) if (r.device === deviceId && r.astronautId === astronautId && (!last || r.takenAt > last)) last = r.takenAt;
  return last;
}
