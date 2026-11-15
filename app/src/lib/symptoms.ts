import type { Reason } from './status';
import type { BodySystem, Status, SymptomLog } from './types';

/**
 * Symptom checklist (PRD §5.4): a quick tap list grouped by body system.
 * Symptoms feed the same OK / Watch / Act status as the measurements:
 *
 *  - Only the newest checklist counts, and only while it is less than 2 days old.
 *    Saving "no symptoms today" clears the flag.
 *  - Any symptom                      → Watch
 *  - The same symptom 3 days in a row → Act (a Watch asks for a re-check within 3 days)
 *  - An urgent symptom                → Act straight away
 *
 * These rules are HealthLens settings, not clinical criteria. The advice shown with them
 * is the `symptoms` guide in `guides.ts`.
 */
export interface SymptomDef {
  id: string;
  label: string;
  /** Act straight away, without waiting to see if it lasts */
  urgent?: boolean;
}

export interface SymptomGroup {
  title: string;
  system: BodySystem;
  symptoms: SymptomDef[];
}

export const SYMPTOM_GROUPS: SymptomGroup[] = [
  {
    title: 'Infection and immune system', system: 'immune',
    symptoms: [
      { id: 'fever', label: 'Fever or chills' },
      { id: 'rash', label: 'Rash or itchy skin' },
      { id: 'coldSores', label: 'Cold sores' },
      { id: 'congestion', label: 'Blocked or runny nose' },
      { id: 'soreThroat', label: 'Sore throat or cough' },
      { id: 'wound', label: 'Wound that is red, swollen or slow to heal' },
    ],
  },
  {
    title: 'Brain and balance', system: 'behavioral',
    symptoms: [
      { id: 'dizziness', label: 'Dizziness' },
      { id: 'balance', label: 'Balance problems' },
      { id: 'headache', label: 'Headache' },
      { id: 'concentration', label: 'Trouble concentrating' },
      { id: 'nausea', label: 'Nausea or motion sickness' },
    ],
  },
  {
    title: 'Eyes', system: 'vision',
    symptoms: [
      { id: 'blurredVision', label: 'Blurred or changed vision' },
      { id: 'eyeIrritation', label: 'Sore or irritated eyes' },
    ],
  },
  {
    title: 'Heart and breathing (urgent)', system: 'cardiovascular',
    symptoms: [
      { id: 'chestPain', label: 'Chest pain', urgent: true },
      { id: 'breathing', label: 'Trouble breathing', urgent: true },
      { id: 'fainting', label: 'Fainting or nearly fainting', urgent: true },
    ],
  },
];

export const symptomById: Record<string, SymptomDef> = Object.fromEntries(
  SYMPTOM_GROUPS.flatMap((g) => g.symptoms).map((s) => [s.id, s]),
);

const DAY = 86_400_000;
export const SYMPTOM_ACTIVE_DAYS = 2;
export const SYMPTOM_STREAK_DAYS = 3;

const dayOf = (iso: string) => Math.floor(Date.parse(iso) / DAY);

/** The newest checklist of one astronaut, if it is recent enough to still count. `logs` must be one astronaut's. */
export function activeSymptomLog(logs: SymptomLog[], now: number): SymptomLog | undefined {
  if (logs.length === 0) return undefined;
  const latest = logs.reduce((a, b) => (a.takenAt >= b.takenAt ? a : b));
  return now - Date.parse(latest.takenAt) < SYMPTOM_ACTIVE_DAYS * DAY ? latest : undefined;
}

/** How many days in a row, ending with the day of the newest checklist, this symptom was reported. */
export function symptomStreak(logs: SymptomLog[], symptomId: string): number {
  const days = new Set(logs.filter((l) => l.symptoms.includes(symptomId)).map((l) => dayOf(l.takenAt)));
  if (days.size === 0) return 0;
  let day = Math.max(...days);
  let streak = 0;
  while (days.has(day)) { streak++; day--; }
  return streak;
}

/** One reason per body system with symptoms on the active checklist. `logs` must be one astronaut's. */
export function symptomReasons(logs: SymptomLog[], now: number): Reason[] {
  const active = activeSymptomLog(logs, now);
  if (!active || active.symptoms.length === 0) return [];
  const out: Reason[] = [];
  for (const g of SYMPTOM_GROUPS) {
    const mine = g.symptoms.filter((s) => active.symptoms.includes(s.id));
    if (mine.length === 0) continue;
    let status: Status = 'watch';
    const parts = mine.map((s) => {
      const streak = symptomStreak(logs, s.id);
      if (s.urgent || streak >= SYMPTOM_STREAK_DAYS) status = 'act';
      return `${s.label.toLowerCase()}${streak >= 2 ? ` (${streak} days in a row)` : ''}`;
    });
    out.push({ status, kind: 'symptom', system: g.system, source: active.source, text: `Symptoms reported: ${parts.join(', ')}` });
  }
  return out;
}
