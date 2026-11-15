import type { BodySystem, IndicatorId, Source } from './types';

/**
 * Indicator registry: one entry per health indicator (PRD §7).
 * Status rules, reminders, charts and forms should all read from here.
 *
 * Thresholds are PLACEHOLDER reference values for adults on Earth, taken from PRD §7.
 * TODO: verify each against a cited source before the demo.
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
}

export const INDICATORS: IndicatorDef[] = [
  { id: 'heartRate', label: 'Resting heart rate', unit: 'bpm', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { actBelow: 40, actAbove: 120 }, baseline: { bad: 'both', watch: 10 } },
  { id: 'systolic', label: 'Blood pressure (systolic)', unit: 'mmHg', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { watchAbove: 130, actAbove: 140 }, baseline: { bad: 'up', watch: 8 } },
  { id: 'diastolic', label: 'Blood pressure (diastolic)', unit: 'mmHg', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { watchAbove: 80, actAbove: 90 }, baseline: { bad: 'up', watch: 8 } },
  { id: 'spo2', label: 'Blood oxygen (SpO₂)', unit: '%', system: 'cardiovascular', cadenceDays: 1, decimals: 0, entrySource: 'manual',
    limits: { watchBelow: 95, actBelow: 92 } },
  { id: 'temperature', label: 'Body temperature', unit: '°C', system: 'immune', cadenceDays: 1, decimals: 1, entrySource: 'manual',
    limits: { watchAbove: 37.3, actAbove: 38 } },
  { id: 'bodyMass', label: 'Body mass', unit: 'kg', system: 'musculoskeletal', cadenceDays: 7, decimals: 1, entrySource: 'manual',
    baseline: { bad: 'down', watch: 2, act: 5, pct: true } },
  { id: 'sleepHours', label: 'Sleep', unit: 'h', system: 'behavioral', cadenceDays: 1, decimals: 1, entrySource: 'self-report',
    baseline: { bad: 'down', watch: 1.5 } },
  { id: 'mood', label: 'Mood (1–5)', unit: '', system: 'behavioral', cadenceDays: 1, decimals: 0, entrySource: 'self-report',
    baseline: { bad: 'down', watch: 1.5 } },
  { id: 'stress', label: 'Stress (1–5)', unit: '', system: 'behavioral', cadenceDays: 1, decimals: 0, entrySource: 'self-report',
    baseline: { bad: 'up', watch: 1.5 } },
  { id: 'fatigue', label: 'Fatigue (1–5)', unit: '', system: 'behavioral', cadenceDays: 1, decimals: 0, entrySource: 'self-report',
    baseline: { bad: 'up', watch: 1.5 } },
];

export const indicatorById = Object.fromEntries(INDICATORS.map((d) => [d.id, d])) as Record<IndicatorId, IndicatorDef>;

export function formatValue(def: IndicatorDef, value: number): string {
  return `${value.toFixed(def.decimals)}${def.unit ? ` ${def.unit}` : ''}`;
}
