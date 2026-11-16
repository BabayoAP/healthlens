import { useSyncExternalStore } from 'react';
import type { EnvironmentId } from './environment';
import { generateSeed } from './mockData';
import type { IndicatorId, Reading, SkinScan, SymptomLog } from './types';

/**
 * The one place health data is saved and loaded (PRD §10). Browser-only, works offline.
 *
 *   const data = useData();                 // in a component: re-renders when data changes
 *   addReading({ astronautId, indicator: 'heartRate', value: 64, takenAt: new Date().toISOString(), source: 'manual' });
 *
 * Demo mode ON  → seeded crew history (tagged `simulated`) + anything entered on this device.
 * Demo mode OFF → only what was entered on this device.
 */

const KEY = 'healthlens.v1';

interface Saved {
  demoMode: boolean;
  environment: EnvironmentId;
  readings: Reading[];
  skinScans: SkinScan[];
  symptomLogs: SymptomLog[];
}

export interface Data {
  demoMode: boolean;
  /** Where the crew is (PRD §6). Look details up with `environmentById[data.environment]`. */
  environment: EnvironmentId;
  /** Seeded + entered, when demo mode is on */
  readings: Reading[];
  skinScans: SkinScan[];
  /** Symptom checklists entered on this device (the demo crew has none seeded) */
  symptomLogs: SymptomLog[];
  /** Timestamp to evaluate "how long ago" against. Refreshed whenever data changes. */
  now: number;
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { demoMode: true, environment: 'spacecraft', readings: [], skinScans: [], symptomLogs: [], ...JSON.parse(raw) };
  } catch { /* storage blocked or corrupt: start fresh */ }
  return { demoMode: true, environment: 'spacecraft', readings: [], skinScans: [], symptomLogs: [] };
}

let saved = load();
let data = build();
const listeners = new Set<() => void>();

function build(): Data {
  const now = Date.now();
  const seed = saved.demoMode ? generateSeed(now) : { readings: [], skinScans: [] };
  return {
    demoMode: saved.demoMode,
    environment: saved.environment,
    readings: [...seed.readings, ...saved.readings],
    skinScans: [...seed.skinScans, ...saved.skinScans],
    symptomLogs: saved.symptomLogs,
    now,
  };
}

function update(next: Saved) {
  saved = next;
  try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* still works for this session */ }
  data = build();
  listeners.forEach((l) => l());
}

export function useData(): Data {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => data,
  );
}

export function addReadings(rs: Omit<Reading, 'id'>[]) {
  update({ ...saved, readings: [...saved.readings, ...rs.map((r) => ({ ...r, id: crypto.randomUUID() }))] });
}
export const addReading = (r: Omit<Reading, 'id'>) => addReadings([r]);

export function addSkinScan(s: Omit<SkinScan, 'id'>) {
  update({ ...saved, skinScans: [...saved.skinScans, { ...s, id: crypto.randomUUID() }] });
}

/** Saves one symptom checklist. Pass an empty list for "no symptoms today". */
export function addSymptomLog(l: Omit<SymptomLog, 'id'>) {
  update({ ...saved, symptomLogs: [...saved.symptomLogs, { ...l, id: crypto.randomUUID() }] });
}

export function setDemoMode(on: boolean) {
  update({ ...saved, demoMode: on });
}

export function setEnvironment(environment: EnvironmentId) {
  update({ ...saved, environment });
}

/** Deletes everything entered on this device. Seeded demo data is not affected. */
export function clearEnteredData() {
  update({ ...saved, readings: [], skinScans: [], symptomLogs: [] });
}

/** One astronaut's readings for one indicator, oldest first. */
export function readingsFor(d: Data, astronautId: string, indicator: IndicatorId): Reading[] {
  return d.readings
    .filter((r) => r.astronautId === astronautId && r.indicator === indicator)
    .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
}
