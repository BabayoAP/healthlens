import { describe, expect, it } from 'vitest';
import { environmentById } from './environment';
import { buildInsights, buildReport } from './insights';
import { crew, generateSeed } from './mockData';
import { buildReminders, dueText, needsDoing } from './reminders';
import { evaluateAstronaut } from './status';

const NOW = Date.parse('2026-11-15T12:00:00Z');
const seed = generateSeed(NOW);
const ev = (id: string) => evaluateAstronaut(id, seed.readings, seed.skinScans, NOW);
const station = environmentById.station;
const mars = environmentById.mars;

describe('insights for the seeded crew', () => {
  it('a1: one skin insight at Act, with how to reach the flight surgeon', () => {
    const [ins, ...rest] = buildInsights(ev('a1'), station);
    expect(rest).toEqual([]);
    expect(ins).toMatchObject({ id: 'skin', status: 'act', tab: 'skin', onlyMissing: false });
    expect(ins.escalate).toMatch(/talk live/);
  });

  it('changes the escalation advice with the environment', () => {
    const [ins] = buildInsights(ev('a1'), mars);
    expect(ins.escalate).toMatch(/without waiting for the reply/);
  });

  it('a2: systolic and diastolic become one blood pressure insight', () => {
    const list = buildInsights(ev('a2'), station);
    expect(list.map((i) => i.id)).toEqual(['bloodPressure']);
    expect(list[0].saw.length).toBeGreaterThanOrEqual(2);
    expect(list[0].escalate).not.toMatch(/Act level/);
  });

  it('a3: healthy, no insights', () => {
    expect(buildInsights(ev('a3'), station)).toEqual([]);
  });

  it('a4: a skipped measurement gets the how-to steps, not the "looks wrong" steps', () => {
    const list = buildInsights(ev('a4'), station);
    expect(list.map((i) => i.id).sort()).toEqual(['heartRate', 'sleep', 'temperature']);
    const temp = list.find((i) => i.id === 'temperature')!;
    expect(temp.onlyMissing).toBe(true);
    expect(temp.todo[0]).toMatch(/Wait 15 minutes/);
  });

  it('report lists findings and keeps simulated values labeled', () => {
    const e = ev('a1');
    const text = buildReport(crew[0], e, buildInsights(e, station), station, NOW);
    expect(text).toMatch(/Overall status: ACT/);
    expect(text).toMatch(/1\. Skin scan: ACT/);
    expect(text).toMatch(/\[simulated\]/);
    expect(text).toMatch(/not a medical device/);
  });
});

describe('reminders for the seeded crew', () => {
  const rem = (id: string) => buildReminders(id, ev(id), seed.skinScans, NOW);

  it('a4: temperature is overdue and comes first', () => {
    const [first] = rem('a4');
    expect(first).toMatchObject({ id: 'temperature', state: 'overdue', dueInDays: -4 });
    expect(dueText(first)).toBe('overdue by 4 days');
  });

  it('a3: never had a skin scan, so it is due', () => {
    const skin = rem('a3').find((r) => r.id === 'skin')!;
    expect(skin.state).toBe('due');
    expect(dueText(skin)).toBe('not done yet');
  });

  it('a1: everything was done today, nothing needs doing', () => {
    expect(rem('a1').filter(needsDoing)).toEqual([]);
    expect(rem('a1').find((r) => r.id === 'skin')).toMatchObject({ state: 'upcoming', dueInDays: 7 });
  });

  it('groups blood pressure into one check', () => {
    expect(rem('a2').map((r) => r.id)).toEqual(expect.arrayContaining(['bloodPressure', 'mood']));
    expect(rem('a2')).toHaveLength(8);
  });
});
