import { describe, expect, it } from 'vitest';
import { GUIDES } from './guides';
import { buildInsights } from './insights';
import { environmentById } from './environment';
import { evaluateAstronaut } from './status';
import { symptomReasons, symptomStreak } from './symptoms';
import type { SymptomLog } from './types';

const DAY = 86_400_000;
const NOW = Date.parse('2026-11-15T12:00:00Z');
const log = (daysAgo: number, symptoms: string[]): SymptomLog => ({
  id: `l${daysAgo}`, astronautId: 'x', symptoms, source: 'self-report',
  takenAt: new Date(NOW - daysAgo * DAY - 3_600_000).toISOString(),
});

describe('symptom rules', () => {
  it('a symptom today is Watch, grouped by body system', () => {
    const rs = symptomReasons([log(0, ['dizziness', 'headache', 'rash'])], NOW);
    expect(rs.map((r) => `${r.system}:${r.status}`).sort()).toEqual(['behavioral:watch', 'immune:watch']);
    expect(rs.find((r) => r.system === 'behavioral')!.text).toBe('Symptoms reported: dizziness, headache');
  });

  it('an urgent symptom is Act straight away', () => {
    expect(symptomReasons([log(0, ['chestPain'])], NOW)[0]).toMatchObject({ status: 'act', system: 'cardiovascular' });
  });

  it('the same symptom 3 days in a row becomes Act', () => {
    const logs = [log(2, ['headache']), log(1, ['headache']), log(0, ['headache'])];
    expect(symptomStreak(logs, 'headache')).toBe(3);
    expect(symptomReasons(logs, NOW)[0]).toMatchObject({ status: 'act', text: 'Symptoms reported: headache (3 days in a row)' });
    expect(symptomReasons(logs.slice(1), NOW)[0].status).toBe('watch');
  });

  it('"no symptoms today" clears the flag, and an old checklist stops counting', () => {
    expect(symptomReasons([log(1, ['fever']), log(0, [])], NOW)).toEqual([]);
    expect(symptomReasons([log(3, ['fever'])], NOW)).toEqual([]);
  });

  it('feeds the overall status and gets one insight card', () => {
    const ev = evaluateAstronaut('x', [], [], NOW, [log(0, ['fever']), { ...log(0, ['chestPain']), astronautId: 'someone-else' }]);
    expect(ev).toMatchObject({ status: 'watch', hasData: true });
    const [ins] = buildInsights(ev, environmentById.station);
    expect(ins).toMatchObject({ id: 'symptoms', status: 'watch', tab: 'check-in' });
  });

  it('every indicator-less guide is one the rules know about', () => {
    expect(GUIDES.filter((g) => g.indicators.length === 0).map((g) => g.id)).toEqual(['skin', 'symptoms']);
  });
});
