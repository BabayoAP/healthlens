import { describe, expect, it } from 'vitest';
import { EMERGENCY_GUIDES, byPriority, suggestEmergencies } from './emergency';
import { ENVIRONMENTS } from './environment';
import { SOURCES } from './sources';
import type { Reading, SymptomLog } from './types';

const now = Date.UTC(2026, 10, 15, 12);
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
const reading = (indicator: Reading['indicator'], value: number, h = 1): Reading =>
  ({ id: `${indicator}-${h}`, astronautId: 'a1', indicator, value, takenAt: hoursAgo(h), source: 'manual' });
const symptoms = (ids: string[], h = 1): SymptomLog =>
  ({ id: `s-${h}`, astronautId: 'a1', takenAt: hoursAgo(h), symptoms: ids, source: 'self-report' });

describe('emergency guides', () => {
  it('every guide has signs, steps in every environment, and known sources', () => {
    expect(EMERGENCY_GUIDES.length).toBeGreaterThanOrEqual(15);
    for (const g of EMERGENCY_GUIDES) {
      expect(g.signs.length).toBeGreaterThan(0);
      expect(g.sources.length).toBeGreaterThan(0);
      for (const s of g.sources) expect(SOURCES[s]).toBeDefined();
      for (const env of ENVIRONMENTS) expect(g.steps(env).length).toBeGreaterThanOrEqual(5);
    }
  });

  it('ids are unique and the list sorts life-threatening first', () => {
    expect(new Set(EMERGENCY_GUIDES.map((g) => g.id)).size).toBe(EMERGENCY_GUIDES.length);
    const p = byPriority().map((g) => g.priority);
    expect(p).toEqual([...p].sort());
    expect(p[0]).toBe(1);
  });

  it('CPR steps change with gravity', () => {
    const cpr = EMERGENCY_GUIDES.find((g) => g.id === 'cardiac-arrest')!;
    const station = ENVIRONMENTS.find((e) => e.id === 'station')!;
    const moon = ENVIRONMENTS.find((e) => e.id === 'moon')!;
    expect(cpr.steps(station)[2].title).toMatch(/weightless/i);
    expect(cpr.steps(moon)[2].title).toMatch(/flat/i);
  });
});

describe('suggested emergencies', () => {
  it('suggests nothing for a healthy crew member', () => {
    expect(suggestEmergencies(['a1'], [reading('spo2', 98)], [symptoms([])], now)).toEqual([]);
  });

  it('suggests a guide from an urgent symptom in the last 24 hours', () => {
    const s = suggestEmergencies(['a1'], [], [symptoms(['chestPain'])], now);
    expect(s.map((x) => x.guide.id)).toEqual(['chest-pain']);
    expect(suggestEmergencies(['a1'], [], [symptoms(['chestPain'], 30)], now)).toEqual([]);
  });

  it('suggests a guide from a reading past an Act limit, in the right direction', () => {
    expect(suggestEmergencies(['a1'], [reading('spo2', 91)], [], now)[0]).toMatchObject({ astronautId: 'a1', why: expect.stringContaining('91%') });
    expect(suggestEmergencies(['a1'], [reading('glucose', 50)], [], now).map((x) => x.guide.id)).toEqual(['low-sugar']);
    expect(suggestEmergencies(['a1'], [reading('glucose', 140)], [], now)).toEqual([]);
  });

  it('uses only the latest reading and puts the most urgent first', () => {
    const rs = [reading('spo2', 90, 3), reading('spo2', 97, 1), reading('glucose', 50)];
    expect(suggestEmergencies(['a1'], rs, [], now).map((x) => x.guide.id)).toEqual(['low-sugar']);
    const both = suggestEmergencies(['a1'], [reading('glucose', 50)], [symptoms(['breathing'])], now);
    expect(both.map((x) => x.guide.priority)).toEqual([1, 2]);
  });
});
