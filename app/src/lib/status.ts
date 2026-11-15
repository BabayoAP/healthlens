import { INDICATORS, formatValue, type IndicatorDef } from './indicators';
import type { IndicatorId, Reading, SkinScan, Source, Status } from './types';

/**
 * Status rules (PRD §8). Explainable on purpose: every status comes with reasons a person can read.
 *
 * Per indicator, in this order:
 *  1. Absolute safety limits                → Watch / Act straight away
 *  2. Change vs the astronaut's own baseline → Watch; Act only if the reading before it agrees
 *                                              (one odd reading asks for a re-measure first)
 *  3. Sustained trend                       → Watch when values drift steadily in a bad direction,
 *                                              even if every single value still looks normal
 *  4. Missing measurements                  → Watch when a check is well overdue
 */

const DAY = 86_400_000;
const BASELINE_READINGS = 7; // first N readings form the personal baseline
const MIN_FOR_BASELINE = 5;
const TREND_WINDOW_DAYS = 14;
const MIN_FOR_TREND = 6;
const TREND_FRACTION = 0.5; // a steady drift of half the "watch" change is enough to flag
const TREND_MIN_R2 = 0.6; // how consistent the drift must be (1 = perfectly steady)

const rank: Record<Status, number> = { ok: 0, watch: 1, act: 2 };
export const worst = (a: Status, b: Status): Status => (rank[a] >= rank[b] ? a : b);

export interface Reason {
  status: Status;
  kind: 'limit' | 'baseline' | 'trend' | 'missing' | 'skin';
  text: string;
  indicator?: IndicatorId;
  /** Source of the data that triggered this reason, so the UI can tag simulated/estimated values */
  source?: Source;
}

export interface IndicatorEval {
  def: IndicatorDef;
  status: Status;
  reasons: Reason[];
  latest?: Reading;
  baseline?: number;
  /** latest − baseline */
  delta?: number;
  /** Change over the trend window, when a sustained trend was found */
  trendChange?: number;
  daysSince?: number;
  /** Time to measure again */
  due: boolean;
}

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

function limitStatus(def: IndicatorDef, v: number): Status {
  const l = def.limits;
  if (!l) return 'ok';
  if ((l.actAbove !== undefined && v >= l.actAbove) || (l.actBelow !== undefined && v < l.actBelow)) return 'act';
  if ((l.watchAbove !== undefined && v >= l.watchAbove) || (l.watchBelow !== undefined && v < l.watchBelow)) return 'watch';
  return 'ok';
}

/** How far `v` has moved from baseline in the bad direction (0 if it moved the good way). */
function badChange(def: IndicatorDef, v: number, baseline: number): number {
  const b = def.baseline!;
  const raw = b.pct ? ((v - baseline) / baseline) * 100 : v - baseline;
  if (b.bad === 'up') return Math.max(0, raw);
  if (b.bad === 'down') return Math.max(0, -raw);
  return Math.abs(raw);
}

function baselineStatus(def: IndicatorDef, v: number, baseline: number): Status {
  const b = def.baseline!;
  const change = badChange(def, v, baseline);
  if (b.act !== undefined && change >= b.act) return 'act';
  return change >= b.watch ? 'watch' : 'ok';
}

/** Least-squares line through (day, value). Returns total change across the window and how well a line fits. */
function trend(rs: Reading[]): { change: number; r2: number } {
  const t = rs.map((r) => Date.parse(r.takenAt) / DAY);
  const y = rs.map((r) => r.value);
  const mt = mean(t), my = mean(y);
  let stt = 0, sty = 0, syy = 0;
  for (let i = 0; i < t.length; i++) {
    stt += (t[i] - mt) ** 2; sty += (t[i] - mt) * (y[i] - my); syy += (y[i] - my) ** 2;
  }
  if (stt === 0 || syy === 0) return { change: 0, r2: 0 };
  const slope = sty / stt;
  return { change: slope * (t[t.length - 1] - t[0]), r2: (sty * sty) / (stt * syy) };
}

export function evaluateIndicator(def: IndicatorDef, readings: Reading[], now: number): IndicatorEval {
  const rs = readings.filter((r) => r.indicator === def.id).sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const out: IndicatorEval = { def, status: 'ok', reasons: [], due: true };
  if (rs.length === 0) return out;

  const latest = rs[rs.length - 1];
  const prev = rs[rs.length - 2];
  out.latest = latest;
  const add = (status: Status, kind: Reason['kind'], text: string) => {
    out.status = worst(out.status, status);
    out.reasons.push({ status, kind, text, indicator: def.id, source: latest.source });
  };
  const shown = formatValue(def, latest.value);

  // 1. Absolute limits
  const lim = limitStatus(def, latest.value);
  if (lim !== 'ok') add(lim, 'limit', `${def.label} is ${shown}, ${lim === 'act' ? 'outside the safe range' : 'outside the normal range'}`);

  // 2. Change vs personal baseline
  if (def.baseline && rs.length >= MIN_FOR_BASELINE) {
    const baseline = mean(rs.slice(0, BASELINE_READINGS).map((r) => r.value));
    out.baseline = baseline;
    out.delta = latest.value - baseline;
    const now_ = baselineStatus(def, latest.value, baseline);
    if (now_ !== 'ok' && rs.length > BASELINE_READINGS) {
      const sign = out.delta > 0 ? '+' : '−';
      const size = def.baseline.pct
        ? `${Math.abs((out.delta / baseline) * 100).toFixed(1)}%`
        : formatValue(def, Math.abs(out.delta));
      const confirmed = prev !== undefined && baselineStatus(def, prev.value, baseline) !== 'ok';
      if (confirmed) add(now_, 'baseline', `${def.label} is ${shown} (${sign}${size} vs your baseline), two readings in a row`);
      else add('watch', 'baseline', `${def.label} is ${shown} (${sign}${size} vs your baseline). Single reading: measure again to confirm`);
    }

    // 3. Sustained trend
    const recent = rs.filter((r) => now - Date.parse(r.takenAt) <= TREND_WINDOW_DAYS * DAY);
    if (recent.length >= MIN_FOR_TREND) {
      const { change, r2 } = trend(recent);
      const first = recent[0].value;
      const size = def.baseline.pct ? (Math.abs(change) / baseline) * 100 : Math.abs(change);
      const bad = def.baseline.bad === 'both' || (def.baseline.bad === 'up') === (change > 0);
      if (bad && r2 >= TREND_MIN_R2 && size >= def.baseline.watch * TREND_FRACTION) {
        out.trendChange = change;
        const days = Math.round((Date.parse(latest.takenAt) - Date.parse(recent[0].takenAt)) / DAY);
        add('watch', 'trend', `${def.label} has ${change > 0 ? 'risen' : 'fallen'} steadily over ${days} days (about ${formatValue(def, first)} → ${shown})`);
      }
    }
  }

  // 4. Missing measurements
  const daysSince = Math.floor((now - Date.parse(latest.takenAt)) / DAY);
  out.daysSince = daysSince;
  out.due = daysSince >= def.cadenceDays;
  if (daysSince >= Math.max(def.cadenceDays * 2, def.cadenceDays + 3)) {
    add('watch', 'missing', `No ${def.label.toLowerCase()} reading in ${daysSince} days`);
  }
  return out;
}

export interface StatusResult {
  status: Status;
  reasons: Reason[];
}

/** Uses the most recent scan of each body region. */
export function skinStatus(scans: SkinScan[]): StatusResult {
  const latestByRegion = new Map<string, SkinScan>();
  for (const s of scans) {
    const cur = latestByRegion.get(s.region);
    if (!cur || s.takenAt > cur.takenAt) latestByRegion.set(s.region, s);
  }
  const reasons: Reason[] = [];
  let status: Status = 'ok';
  for (const scan of latestByRegion.values()) {
    for (const l of scan.lesions) {
      if (l.risk === 'ok') continue;
      status = worst(status, l.risk);
      reasons.push({
        status: l.risk, kind: 'skin', source: scan.source,
        text: `Skin, ${scan.region.replace('-', ' ')}: ${l.change} spot, ${l.diameterMm} mm (${l.notes.join(', ')})`,
      });
    }
  }
  return { status, reasons };
}

export interface AstronautEval extends StatusResult {
  /** One line per indicator (the most serious, then the most informative). Use this for summaries. */
  headlines: Reason[];
  indicators: IndicatorEval[];
  hasData: boolean;
}

export function evaluateAstronaut(astronautId: string, readings: Reading[], skinScans: SkinScan[], now: number): AstronautEval {
  const mine = readings.filter((r) => r.astronautId === astronautId);
  const scans = skinScans.filter((s) => s.astronautId === astronautId);
  const indicators = INDICATORS.map((def) => evaluateIndicator(def, mine, now));
  const skin = skinStatus(scans);
  const reasons = [...skin.reasons, ...indicators.flatMap((i) => i.reasons)].sort((a, b) => rank[b.status] - rank[a.status]);
  const status = reasons.reduce<Status>((s, r) => worst(s, r.status), 'ok');
  const kindRank: Record<Reason['kind'], number> = { skin: 4, trend: 3, baseline: 2, limit: 1, missing: 0 };
  const best = new Map<string, Reason>();
  for (const r of reasons) {
    const key = r.indicator ?? r.text;
    const cur = best.get(key);
    if (!cur || rank[r.status] > rank[cur.status] || (rank[r.status] === rank[cur.status] && kindRank[r.kind] > kindRank[cur.kind])) best.set(key, r);
  }
  const headlines = [...best.values()].sort((a, b) => rank[b.status] - rank[a.status]);
  return { status, reasons, headlines, indicators, hasData: mine.length > 0 || scans.length > 0 };
}

export const nextStep: Record<Status, string> = {
  ok: 'No action needed. Keep your regular check schedule.',
  watch: 'Re-check within 3 days and log any symptoms.',
  act: 'Re-check today and send the report to the flight surgeon at the next comm window.',
};
