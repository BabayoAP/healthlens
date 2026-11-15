import type { SourceId } from './sources';
import type { BodySystem, IndicatorId, Source } from './types';

/**
 * Indicator registry: one entry per health indicator (PRD §7).
 * Status rules, reminders, charts and forms should all read from here.
 *
 * Absolute limits come from the cited public references (adult values on Earth).
 * "Change vs your baseline" sizes are HealthLens settings, chosen to catch a change early.
 * They are not clinical standards, and `basis` says so in plain words for each indicator.
 */
export interface IndicatorDef {
  id: IndicatorId;
  label: string;
  unit: string;
  system: BodySystem;
  /** How often it should be measured, in days */
  cadenceDays: number;
  decimals: number;
  /** Source to use for a normal entry of this indicator */
  entrySource: Source;
  /** Absolute safety limits. "Above" means value >= limit, "below" means value < limit. */
  limits?: { watchAbove?: number; actAbove?: number; watchBelow?: number; actBelow?: number };
  /**
   * Change against the astronaut's own baseline.
   * `bad`: which direction is a problem. `watch`/`act`: size of change that triggers it
   * (in the indicator's unit, or in percent of baseline when `pct` is true).
   */
  baseline?: { bad: 'up' | 'down' | 'both'; watch: number; act?: number; pct?: boolean };
  /** Where the numbers above come from, in plain words (shown in the app) */
  basis: string;
  sources: SourceId[];
}

export const INDICATORS: IndicatorDef[] = [
  { id: 'heartRate', label: 'Resting heart rate', unit: 'bpm', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { actBelow: 40, actAbove: 120 }, baseline: { bad: 'both', watch: 10 },
    basis: 'Normal adult resting pulse is 60 to 100 beats per minute, and 40 to 60 for well-trained athletes (MedlinePlus). The act limits (below 40, 120 or more) and the 10-beat change from baseline are HealthLens settings.',
    sources: ['mlPulse'] },
  { id: 'systolic', label: 'Blood pressure (systolic)', unit: 'mmHg', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { watchAbove: 130, actAbove: 140 }, baseline: { bad: 'up', watch: 8 },
    basis: 'American Heart Association categories: normal below 120, stage 1 high blood pressure from 130, stage 2 from 140. The 8 mmHg change from baseline is a HealthLens setting.',
    sources: ['ahaBp'] },
  { id: 'diastolic', label: 'Blood pressure (diastolic)', unit: 'mmHg', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { watchAbove: 80, actAbove: 90 }, baseline: { bad: 'up', watch: 8 },
    basis: 'American Heart Association categories: normal below 80, stage 1 high blood pressure from 80, stage 2 from 90. The 8 mmHg change from baseline is a HealthLens setting.',
    sources: ['ahaBp'] },
  { id: 'spo2', label: 'Blood oxygen (SpO₂)', unit: '%', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { watchBelow: 95, actBelow: 93 },
    basis: 'MedlinePlus: a normal level is 95% to 100%; contact a provider at 92% or lower; get immediate help at 88% or lower.',
    sources: ['mlSpo2'] },
  { id: 'temperature', label: 'Body temperature', unit: '°C', system: 'immune', cadenceDays: 1, decimals: 1, entrySource: 'manual',
    limits: { watchAbove: 37.3, actAbove: 38 },
    basis: 'MedlinePlus: normal body temperature ranges from 36.1 to 37.2 °C, and an adult probably has a fever above 37.2 to 37.5 °C by mouth. Acting from 38 °C (100.4 °F), a common fever cutoff, is a HealthLens setting.',
    sources: ['mlTemp', 'mlFever'] },
  { id: 'bodyMass', label: 'Body mass', unit: 'kg', system: 'musculoskeletal', cadenceDays: 7, decimals: 1, entrySource: 'manual',
    baseline: { bad: 'down', watch: 2, act: 5, pct: true },
    basis: 'ISS crew lost 2.8% of body mass on average in one NASA study (Zwart 2014). Watching from a 2% loss and acting from 5% are HealthLens settings.',
    sources: ['zwart2014'] },
  { id: 'sleepHours', label: 'Sleep', unit: 'h', system: 'behavioral', cadenceDays: 1, decimals: 1, entrySource: 'self-report',
    baseline: { bad: 'down', watch: 1.5 },
    basis: 'NASA schedules 8.5 hours of sleep a night, but ISS crew averaged 6.1 hours (Barger 2014). The 1.5-hour drop from baseline is a HealthLens setting.',
    sources: ['barger2014'] },
  { id: 'mood', label: 'Mood (1–5)', unit: '', system: 'behavioral', cadenceDays: 1, decimals: 0, entrySource: 'self-report',
    baseline: { bad: 'down', watch: 1.5 },
    basis: 'A self-rating, compared only with your own usual score. The 1.5-point change is a HealthLens setting, not a clinical scale.',
    sources: ['hrpHazards'] },
  { id: 'stress', label: 'Stress (1–5)', unit: '', system: 'behavioral', cadenceDays: 1, decimals: 0, entrySource: 'self-report',
    baseline: { bad: 'up', watch: 1.5 },
    basis: 'A self-rating, compared only with your own usual score. The 1.5-point change is a HealthLens setting, not a clinical scale.',
    sources: ['hrpHazards'] },
  { id: 'fatigue', label: 'Fatigue (1–5)', unit: '', system: 'behavioral', cadenceDays: 1, decimals: 0, entrySource: 'self-report',
    baseline: { bad: 'up', watch: 1.5 },
    basis: 'A self-rating, compared only with your own usual score. The 1.5-point change is a HealthLens setting, not a clinical scale.',
    sources: ['hrpHazards'] },
];

export const indicatorById = Object.fromEntries(INDICATORS.map((d) => [d.id, d])) as Record<IndicatorId, IndicatorDef>;

export function formatValue(def: IndicatorDef, value: number): string {
  return `${value.toFixed(def.decimals)}${def.unit ? `${def.unit === '%' ? '' : ' '}${def.unit}` : ''}`;
}
