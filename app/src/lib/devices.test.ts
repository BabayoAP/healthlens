import { describe, expect, it } from 'vitest';
import { DEVICES, deviceById, lastSync, simulateSync } from './devices';
import { environmentById } from './environment';
import type { Reading } from './types';

const now = Date.UTC(2026, 10, 15, 12);
const r = (indicator: Reading['indicator'], value: number, daysAgo: number): Reading => ({
  id: `${indicator}-${daysAgo}`, astronautId: 'a1', indicator, value, source: 'manual',
  takenAt: new Date(now - daysAgo * 86_400_000).toISOString(),
});

describe('simulated device sync', () => {
  it('reads every indicator the device measures, tagged simulated with the device id', () => {
    const out = simulateSync(deviceById.bioMonitor, 'a1', [], now, () => 0.5);
    expect(out.map((x) => x.indicator)).toEqual(deviceById.bioMonitor.measures);
    expect(out.every((x) => x.source === 'simulated' && x.device === 'bioMonitor')).toBe(true);
  });

  it("continues the person's own recent values", () => {
    const history = [r('glucose', 120, 3), r('glucose', 124, 2), r('glucose', 122, 1)];
    const [g] = simulateSync(deviceById.bloodAnalyzer, 'a1', history, now, () => 0.5);
    expect(g.value).toBe(122);
  });

  it('keeps values possible and blood pressure in the right order', () => {
    const history = [r('spo2', 100, 1), r('systolic', 90, 1), r('diastolic', 89, 1)];
    for (const rand of [() => 0, () => 0.999]) {
      const out = simulateSync(deviceById.bioMonitor, 'a1', history, now, rand);
      const v = (id: string) => out.find((x) => x.indicator === id)!.value;
      expect(v('spo2')).toBeLessThanOrEqual(100);
      expect(v('diastolic')).toBeLessThan(v('systolic'));
    }
  });

  it('finds the last sync per device and person', () => {
    const synced = simulateSync(deviceById.thermometer, 'a1', [], now).map((x, i) => ({ ...x, id: `t${i}` }));
    expect(lastSync('thermometer', 'a1', synced)).toBe(new Date(now).toISOString());
    expect(lastSync('thermometer', 'a2', synced)).toBeUndefined();
  });

  it('knows where a device cannot be used', () => {
    const mass = DEVICES.find((d) => d.id === 'massDevice')!;
    expect(mass.unavailable?.(environmentById.rover)).toBeTruthy();
    expect(mass.unavailable?.(environmentById.station)).toBeUndefined();
  });
});
