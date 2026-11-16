import { GUIDES, type CheckTab } from './guides';
import type { AstronautEval } from './status';
import { INDICATORS } from './indicators';
import type { Reading, SkinScan } from './types';

/**
 * Reminders (PRD §5.11): which checks are due or overdue for one astronaut.
 * One reminder per measurement guide, so blood pressure is one check, not two.
 * Cadence comes from the indicator registry; skin scans are weekly (see the skin guide).
 */
export const SKIN_CADENCE_DAYS = 7;
const DAY = 86_400_000;

export interface Reminder {
  /** Guide id */
  id: string;
  label: string;
  cadenceDays: number;
  /** Days since it was last done. Undefined if it has never been done. */
  daysSince?: number;
  /** 0 = due today, negative = that many days late, positive = days until due */
  dueInDays: number;
  state: 'overdue' | 'due' | 'upcoming';
  /** Screen where the check is done */
  tab: CheckTab;
}

function make(id: string, label: string, cadenceDays: number, daysSince: number | undefined, tab: Reminder['tab']): Reminder {
  const dueInDays = daysSince === undefined ? 0 : cadenceDays - daysSince;
  return { id, label, cadenceDays, daysSince, dueInDays, tab, state: dueInDays < 0 ? 'overdue' : dueInDays === 0 ? 'due' : 'upcoming' };
}

/** All checks for one astronaut, most overdue first. `scans` can be the whole crew's. */
export function buildReminders(astronautId: string, ev: AstronautEval, scans: SkinScan[], now: number): Reminder[] {
  const out: Reminder[] = [];
  for (const g of GUIDES) {
    if (g.id === 'skin') {
      const times = scans.filter((s) => s.astronautId === astronautId).map((s) => Date.parse(s.takenAt));
      const daysSince = times.length ? Math.floor((now - Math.max(...times)) / DAY) : undefined;
      out.push(make(g.id, g.title, SKIN_CADENCE_DAYS, daysSince, g.tab ?? 'skin'));
      continue;
    }
    const mine = ev.indicators.filter((i) => g.indicators.includes(i.def.id));
    if (mine.length === 0) continue;
    // The group is as stale as its most stale indicator; never measured counts as due now
    const never = mine.some((i) => i.daysSince === undefined);
    const daysSince = never ? undefined : Math.max(...mine.map((i) => i.daysSince!));
    out.push(make(g.id, g.title, Math.min(...mine.map((i) => i.def.cadenceDays)), daysSince, g.tab ?? 'check-in'));
  }
  return out.sort((a, b) => a.dueInDays - b.dueInDays);
}

export const needsDoing = (r: Reminder) => r.state !== 'upcoming';

/** "overdue by 4 days", "due today", "not done yet", "due in 2 days" */
export function dueText(r: Reminder): string {
  const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
  if (r.daysSince === undefined) return 'not done yet';
  if (r.state === 'overdue') return `overdue by ${days(-r.dueInDays)}`;
  if (r.state === 'due') return 'due today';
  return r.dueInDays === 1 ? 'due tomorrow' : `due in ${days(r.dueInDays)}`;
}

export const cadenceText = (days: number) => (days === 1 ? 'Daily' : days === 7 ? 'Weekly' : `Every ${days} days`);

/**
 * How many times a check was done on each day, keyed by days from today (0 = today, -1 = yesterday).
 * A check is done when any of its guide's indicators was measured, or for skin, when a scan was taken.
 */
export function checkHistory(
  guideId: string, astronautId: string, readings: { astronautId: string; indicator: string; takenAt: string }[], scans: SkinScan[], now: number,
): Map<number, number> {
  const g = GUIDES.find((x) => x.id === guideId);
  const today = new Date(now).setHours(0, 0, 0, 0);
  const times = guideId === 'skin'
    ? scans.filter((s) => s.astronautId === astronautId).map((s) => s.takenAt)
    // One check can cover two readings (blood pressure), so count distinct times
    : [...new Set(readings.filter((r) => r.astronautId === astronautId && (g?.indicators as string[] | undefined)?.includes(r.indicator)).map((r) => r.takenAt))];
  const out = new Map<number, number>();
  for (const t of times) {
    const d = Math.floor((new Date(t).setHours(0, 0, 0, 0) - today) / DAY);
    out.set(d, (out.get(d) ?? 0) + 1);
  }
  return out;
}

/** Indicators that are checked every day; a streak day needs all of them */
const DAILY = INDICATORS.filter((d) => d.cadenceDays === 1).map((d) => d.id);

/**
 * Streak (PRD §5.14): consecutive days on which every daily check was done.
 * If today is not finished yet, the streak counts up to yesterday, so it is not lost before the day is over.
 */
export function dailyStreak(astronautId: string, readings: Reading[], now: number): { days: number; doneToday: boolean } {
  const today = new Date(now).setHours(0, 0, 0, 0);
  const byDay = new Map<number, Set<string>>();
  for (const r of readings) {
    if (r.astronautId !== astronautId) continue;
    const d = Math.round((today - new Date(r.takenAt).setHours(0, 0, 0, 0)) / DAY);
    if (!byDay.has(d)) byDay.set(d, new Set());
    byDay.get(d)!.add(r.indicator);
  }
  const complete = (d: number) => DAILY.every((id) => byDay.get(d)?.has(id));
  const doneToday = complete(0);
  let days = 0;
  for (let d = doneToday ? 0 : 1; complete(d); d++) days++;
  return { days, doneToday };
}
