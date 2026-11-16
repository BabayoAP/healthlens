import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { monotonePath } from '../lib/trends';
import type { Source } from '../lib/types';
import { SourceTag } from './SourceTag';

export interface TrendPoint {
  /** Time in ms */
  t: number;
  value: number;
  source: Source;
}

export interface TrendLine {
  value: number;
  label: string;
  kind: 'baseline' | 'watch' | 'act';
}

interface Props {
  /** Used as the accessible name, e.g. "Resting heart rate, last 6 weeks" */
  label: string;
  points: TrendPoint[];
  format: (v: number) => string;
  /** Horizontal reference lines: personal baseline and safety limits */
  lines?: TrendLine[];
  /** Left edge of the time axis in ms (defaults to the first point) */
  from?: number;
  /** Right edge in ms (defaults to the last point) */
  to?: number;
  /**
   * Smallest value range the y-axis may cover. Without it the axis zooms in until normal
   * day-to-day wobble fills the chart and looks like a problem.
   */
  minSpan?: number;
  height?: number;
}

const M = { top: 12, right: 14, bottom: 26, left: 40 };
const day = (t: number) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Round tick step: 1, 2 or 5 times a power of ten */
function niceStep(span: number, target: number): number {
  const raw = span / target;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/**
 * One measure over time, one axis. Single series, so no legend: the card title names it.
 * Styled after Bklit UI's area chart: smooth monotone curve, gradient fill that fades out,
 * horizontal grid only, date axis, crosshair tooltip, and a left-to-right reveal on load.
 * Hover, touch or arrow keys show the value under the crosshair.
 */
export function TrendChart({ label, points, format, lines = [], from, to, minSpan = 0, height = 150 }: Props) {
  const gid = useId();
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [active, setActive] = useState<number>();

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(200, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (points.length === 0) return <p className="muted chart-empty">No readings in this period.</p>;

  const t0 = from ?? points[0].t;
  const t1 = Math.max(to ?? points[points.length - 1].t, t0 + 1);
  const values = points.map((p) => p.value);
  let lo = Math.min(...values), hi = Math.max(...values);
  const dataSpan = Math.max(hi - lo, Math.abs(hi) * 0.02, 0.5);
  // Reference lines join the scale only when they are close enough to be useful context
  const shown = lines.filter((l) => l.value >= lo - dataSpan * 1.5 && l.value <= hi + dataSpan * 1.5);
  for (const l of shown) { lo = Math.min(lo, l.value); hi = Math.max(hi, l.value); }
  if (hi - lo < minSpan) { const mid = (hi + lo) / 2; lo = mid - minSpan / 2; hi = mid + minSpan / 2; }
  const pad = Math.max((hi - lo) * 0.12, dataSpan * 0.1);
  lo -= pad; hi += pad;

  const w = width - M.left - M.right, h = height - M.top - M.bottom;
  const x = (t: number) => M.left + ((t - t0) / (t1 - t0)) * w;
  const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo)) * h;

  const step = niceStep(hi - lo, 3);
  const tickLabel = (v: number) => format(v).replace(/[^\d.,−-]+$/, '');
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
    const n = Number(v.toFixed(6));
    // Skip a tick whose label would repeat the previous one (coarse formats on a narrow range)
    if (!ticks.length || tickLabel(ticks[ticks.length - 1]) !== tickLabel(n)) ticks.push(n);
  }

  const xy = points.map((p): [number, number] => [x(p.t), y(p.value)]);
  const path = monotonePath(xy);
  // About one date label per 110px, evenly spaced across the range
  const nx = Math.max(2, Math.min(6, Math.floor(w / 110) + 1));
  const xTicks = Array.from({ length: nx }, (_, i) => t0 + ((t1 - t0) * i) / (nx - 1));
  const last = points[points.length - 1];
  const a = active !== undefined ? points[Math.min(active, points.length - 1)] : undefined;

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
    let best = 0;
    for (let i = 1; i < points.length; i++) if (Math.abs(x(points[i].t) - px) < Math.abs(x(points[best].t) - px)) best = i;
    setActive(best);
  }
  function onKey(e: KeyboardEvent<SVGSVGElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const cur = active ?? points.length - 1;
    setActive(Math.max(0, Math.min(points.length - 1, cur + (e.key === 'ArrowLeft' ? -1 : 1))));
  }

  // Tooltip sits beside the crosshair and flips sides near the right edge
  const tipLeft = a ? x(a.t) : 0;
  const flip = tipLeft > width * 0.6;

  return (
    <div className="chart" ref={box}>
      <svg
        width={width} height={height} role="img" tabIndex={0}
        aria-label={`${label}. ${points.length} readings, latest ${format(last.value)} on ${day(last.t)}. Use left and right arrow keys to read values.`}
        onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setActive(undefined)}
        onKeyDown={onKey} onBlur={() => setActive(undefined)}
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--series)" stopOpacity=".32" />
            <stop offset="1" stopColor="var(--series)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line className="chart-grid" x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} />
            <text className="chart-tick" x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end">{tickLabel(v)}</text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={t} className="chart-tick" x={x(t)} y={height - 6} textAnchor={i === 0 ? 'start' : i === nx - 1 ? 'end' : 'middle'}>{day(t)}</text>
        ))}

        {shown.map((l) => (
          <line key={l.label} className={`chart-ref chart-ref-${l.kind}`} x1={M.left} x2={width - M.right} y1={y(l.value)} y2={y(l.value)} />
        ))}

        <g className="chart-series">
          <path d={`${path}L${xy[xy.length - 1][0].toFixed(1)},${M.top + h}L${xy[0][0].toFixed(1)},${M.top + h}Z`} fill={`url(#${gid})`} />
          <path className="chart-line" d={path} />
          {/* Readings the crew entered themselves get a marker; simulated history stays a plain line */}
          {points.map((p, i) => p.source !== 'simulated' && (
            <circle key={i} className="chart-dot" cx={xy[i][0]} cy={xy[i][1]} r={3.5} />
          ))}
          <circle className="chart-end" cx={x(last.t)} cy={y(last.value)} r={4} />
        </g>
        {/* Labels go on top of the line so their outline keeps them readable */}
        {shown.map((l) => (
          <text key={l.label} className="chart-ref-label" x={width - M.right - 2} y={y(l.value) - 5} textAnchor="end">{l.label}</text>
        ))}

        {a && (
          <g>
            <line className="chart-cross" x1={x(a.t)} x2={x(a.t)} y1={M.top} y2={M.top + h} />
            <circle className="chart-halo" cx={x(a.t)} cy={y(a.value)} r={9} />
            <circle className="chart-end" cx={x(a.t)} cy={y(a.value)} r={4.5} />
          </g>
        )}
      </svg>
      {a && (
        <div className="chart-tip" style={flip ? { right: width - tipLeft + 14 } : { left: tipLeft + 14 }}>
          <span className="chart-tip-date">{day(a.t)}</span>
          <span className="chart-tip-value"><i aria-hidden="true" /><strong>{format(a.value)}</strong> <SourceTag source={a.source} /></span>
        </div>
      )}
    </div>
  );
}
