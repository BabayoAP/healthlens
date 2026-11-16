import type { IndicatorDef } from './indicators';
import type { IndicatorEval } from './status';
import type { Lesion, SkinScan, Status } from './types';
import type { TrendLine, TrendPoint } from '../components/TrendChart';

/** Personal baseline plus the indicator's safety limits, as chart reference lines. */
export function referenceLines(def: IndicatorDef, ev: IndicatorEval): TrendLine[] {
  const lines: TrendLine[] = [];
  if (ev.baseline !== undefined) lines.push({ value: ev.baseline, label: 'your baseline', kind: 'baseline' });
  const l = def.limits;
  if (l?.watchAbove !== undefined) lines.push({ value: l.watchAbove, label: `watch from ${l.watchAbove}`, kind: 'watch' });
  if (l?.actAbove !== undefined) lines.push({ value: l.actAbove, label: `act from ${l.actAbove}`, kind: 'act' });
  if (l?.watchBelow !== undefined) lines.push({ value: l.watchBelow, label: `watch below ${l.watchBelow}`, kind: 'watch' });
  if (l?.actBelow !== undefined) lines.push({ value: l.actBelow, label: `act below ${l.actBelow}`, kind: 'act' });
  return lines;
}

/** Size of change that matters for this indicator; charts use 2.5x this as their smallest y-range. */
export function watchSize(ev: IndicatorEval): number {
  const b = ev.def.baseline;
  return b ? (b.pct ? ((ev.baseline ?? ev.latest?.value ?? 0) * b.watch) / 100 : b.watch) : 0;
}

export interface SpotHistory { id: string; region: string; latest: Lesion; points: TrendPoint[] }

/** Every scan of one spot, oldest first, matched by lesion id. Only spots seen more than once. Worst first. */
export function spotHistories(scans: SkinScan[]): SpotHistory[] {
  const byId = new Map<string, { region: string; latest: Lesion; points: TrendPoint[] }>();
  for (const scan of [...scans].sort((a, b) => a.takenAt.localeCompare(b.takenAt))) {
    for (const l of scan.lesions) {
      const h = byId.get(l.id) ?? { region: scan.region, latest: l, points: [] };
      h.latest = l;
      h.points.push({ t: Date.parse(scan.takenAt), value: l.diameterMm, source: scan.source });
      byId.set(l.id, h);
    }
  }
  const rank: Record<Status, number> = { act: 0, watch: 1, ok: 2 };
  return [...byId.entries()]
    .map(([id, h]) => ({ id, ...h }))
    .filter((h) => h.points.length > 1)
    .sort((a, b) => rank[a.latest.risk] - rank[b.latest.risk]);
}

/**
 * Smooth SVG path through points without overshooting them (monotone cubic, same curve as
 * d3's curveMonotoneX that Bklit charts use). Points must be sorted by x.
 */
export function monotonePath(p: [number, number][]): string {
  const n = p.length;
  const f = (v: number) => v.toFixed(1);
  if (n === 0) return '';
  if (n === 1) return `M${f(p[0][0])},${f(p[0][1])}`;
  const h: number[] = [], s: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = p[i + 1][0] - p[i][0];
    s[i] = h[i] ? (p[i + 1][1] - p[i][1]) / h[i] : 0;
  }
  const m: number[] = [s[0]];
  for (let i = 1; i < n - 1; i++) {
    const mid = (s[i - 1] * h[i] + s[i] * h[i - 1]) / (h[i - 1] + h[i] || 1);
    m[i] = (Math.sign(s[i - 1]) + Math.sign(s[i])) * Math.min(Math.abs(s[i - 1]), Math.abs(s[i]), 0.5 * Math.abs(mid)) || 0;
  }
  m[n - 1] = s[n - 2];
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const k = h[i] / 3;
    d += `C${f(p[i][0] + k)},${f(p[i][1] + m[i] * k)},${f(p[i + 1][0] - k)},${f(p[i + 1][1] - m[i + 1] * k)},${f(p[i + 1][0])},${f(p[i + 1][1])}`;
  }
  return d;
}
