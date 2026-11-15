import { GUIDES } from './guides';
import type { AstronautEval } from './status';
import type { SkinScan } from './types';

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
  tab: 'check-in' | 'skin';
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
      out.push(make(g.id, g.title, SKIN_CADENCE_DAYS, daysSince, 'skin'));
      continue;
    }
    const mine = ev.indicators.filter((i) => g.indicators.includes(i.def.id));
    if (mine.length === 0) continue;
    // The group is as stale as its most stale indicator; never measured counts as due now
    const never = mine.some((i) => i.daysSince === undefined);
    const daysSince = never ? undefined : Math.max(...mine.map((i) => i.daysSince!));
    out.push(make(g.id, g.title, Math.min(...mine.map((i) => i.def.cadenceDays)), daysSince, 'check-in'));
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
