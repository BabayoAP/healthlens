import { describe, expect, it } from 'vitest';
import { indicatorById } from './indicators';
import { generateSeed } from './mockData';
import { evaluateAstronaut, evaluateIndicator } from './status';
import type { IndicatorId, Reading } from './types';

const DAY = 86_400_000;
const NOW = Date.parse('2026-11-15T12:00:00Z');

/** values[0] is the oldest; the last value was taken `lastDaysAgo` days before NOW, one per day. */
function series(indicator: IndicatorId, values: number[], lastDaysAgo = 0): Reading[] {
  return values.map((value, i) => ({
    id: `${indicator}-${i}`, astronautId: 'x', indicator, value, source: 'manual',
    takenAt: new Date(NOW - (values.length - 1 - i + lastDaysAgo) * DAY - 3_600_000).toISOString(),
  }));
}
const flat = (n: number, v: number) => Array.from({ length: n }, (_, i) => v + (i % 2 ? 1 : -1));

describe('evaluateIndicator', () => {
  it('is OK for steady readings', () => {
    const ev = evaluateIndicator(indicatorById.heartRate, series('heartRate', flat(20, 64)), NOW);
    expect(ev.status).toBe('ok');
    expect(ev.reasons).toEqual([]);
  });

  it('acts straight away on a hard safety limit', () => {
    const ev = evaluateIndicator(indicatorById.spo2, series('spo2', [...flat(10, 97), 90]), NOW);
    expect(ev.status).toBe('act');
    expect(ev.reasons[0].kind).toBe('limit');
  });

  it('asks for a re-measure on a single odd reading instead of escalating', () => {
    const ev = evaluateIndicator(indicatorById.bodyMass, series('bodyMass', [...flat(10, 80), 75]), NOW);
    expect(ev.status).toBe('watch'); // −6% would be Act, but only one reading says so
    expect(ev.reasons[0].text).toMatch(/measure again/);
  });

  it('escalates when two readings in a row agree', () => {
    const ev = evaluateIndicator(indicatorById.bodyMass, series('bodyMass', [...flat(10, 80), 75, 75]), NOW);
    expect(ev.status).toBe('act');
  });

  it('flags a slow steady drift while every value is still in the normal range', () => {
    // 62 → 70 bpm: never leaves 60–100 and never reaches +10 vs baseline
    const values = [...flat(14, 62), 63, 63, 64, 65, 65, 66, 67, 67, 68, 69, 69, 70];
    const ev = evaluateIndicator(indicatorById.heartRate, series('heartRate', values), NOW);
    expect(ev.status).toBe('watch');
    expect(ev.reasons.map((r) => r.kind)).toEqual(['trend']);
  });

  it('does not flag a drift in the good direction', () => {
    const values = [...flat(14, 120), 119, 118, 117, 116, 115, 114, 113, 112];
    const ev = evaluateIndicator(indicatorById.systolic, series('systolic', values), NOW);
    expect(ev.status).toBe('ok');
  });

  it('flags an overdue measurement', () => {
    const ev = evaluateIndicator(indicatorById.temperature, series('temperature', Array(10).fill(36.6), 5), NOW);
    expect(ev.reasons.some((r) => r.kind === 'missing')).toBe(true);
    expect(ev.due).toBe(true);
  });
});

describe('seeded demo crew', () => {
  const seed = generateSeed(NOW);
  const ev = (id: string) => evaluateAstronaut(id, seed.readings, seed.skinScans, NOW);

  it('tags every seeded value as simulated', () => {
    expect(seed.readings.every((r) => r.source === 'simulated')).toBe(true);
    expect(seed.skinScans.every((s) => s.source === 'simulated')).toBe(true);
  });

  it('a1: growing skin spot → Act, vitals clean', () => {
    const r = ev('a1');
    expect(r.status).toBe('act');
    expect(r.reasons.map((x) => x.kind)).toEqual(['skin']);
  });

  it('a2: blood pressure creeping up → Watch', () => {
    const r = ev('a2');
    expect(r.status).toBe('watch');
    expect(r.reasons.some((x) => x.indicator === 'systolic' && x.kind === 'trend')).toBe(true);
    expect(r.reasons.every((x) => x.indicator === 'systolic' || x.indicator === 'diastolic')).toBe(true);
  });

  it('a3: healthy → OK with no reasons', () => {
    expect(ev('a3')).toMatchObject({ status: 'ok', reasons: [] });
  });

  it('a4: slow HR + sleep drift, slower reactions and skipped temperature checks → Watch', () => {
    const r = ev('a4');
    expect(r.status).toBe('watch');
    const kinds = r.reasons.map((x) => `${x.indicator}:${x.kind}`);
    expect(kinds).toContain('heartRate:trend');
    expect(kinds).toContain('sleepHours:trend');
    expect(kinds).toContain('reactionTime:trend');
    expect(kinds).toContain('temperature:missing');
    expect(kinds).toHaveLength(4);
    expect(r.headlines).toHaveLength(4);
  });

  it('summarises one problem as one headline per indicator', () => {
    const r = ev('a2');
    expect(r.headlines.map((x) => `${x.indicator}:${x.kind}`).sort()).toEqual(['diastolic:trend', 'systolic:trend']);
  });

  it('gives the same result on a different day', () => {
    const later = NOW + 9 * DAY;
    const s = generateSeed(later);
    expect(crewStatuses(s, later)).toEqual(['act', 'watch', 'ok', 'watch']);
  });
});

function crewStatuses(s: ReturnType<typeof generateSeed>, now: number) {
  return ['a1', 'a2', 'a3', 'a4'].map((id) => evaluateAstronaut(id, s.readings, s.skinScans, now).status);
}
