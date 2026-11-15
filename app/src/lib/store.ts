import { useSyncExternalStore } from 'react';
import { generateSeed } from './mockData';
import type { IndicatorId, Reading, SkinScan } from './types';

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
  readings: Reading[];
  skinScans: SkinScan[];
}

export interface Data {
  demoMode: boolean;
  /** Seeded + entered, when demo mode is on */
  readings: Reading[];
  skinScans: SkinScan[];
  /** Timestamp to evaluate "how long ago" against. Refreshed whenever data changes. */
  now: number;
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { demoMode: true, readings: [], skinScans: [], ...JSON.parse(raw) };
  } catch { /* storage blocked or corrupt: start fresh */ }
  return { demoMode: true, readings: [], skinScans: [] };
}

let saved = load();
let data = build();
const listeners = new Set<() => void>();

function build(): Data {
  const now = Date.now();
  const seed = saved.demoMode ? generateSeed(now) : { readings: [], skinScans: [] };
  return {
    demoMode: saved.demoMode,
    readings: [...seed.readings, ...saved.readings],
    skinScans: [...seed.skinScans, ...saved.skinScans],
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

export function setDemoMode(on: boolean) {
  update({ ...saved, demoMode: on });
}

/** Deletes everything entered on this device. Seeded demo data is not affected. */
export function clearEnteredData() {
  update({ ...saved, readings: [], skinScans: [] });
}

/** One astronaut's readings for one indicator, oldest first. */
export function readingsFor(d: Data, astronautId: string, indicator: IndicatorId): Reading[] {
  return d.readings
    .filter((r) => r.astronautId === astronautId && r.indicator === indicator)
    .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
}
