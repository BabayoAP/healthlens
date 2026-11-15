import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
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
  /** Shade the area under the line (used by the larger trend explorer) */
  area?: boolean;
}

const M = { top: 10, right: 12, bottom: 20, left: 40 };
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
 * Hover, touch or arrow keys show the value under the crosshair.
 */
export function TrendChart({ label, points, format, lines = [], from, to, minSpan = 0, height = 150, area = false }: Props) {
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

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.value).toFixed(1)}`).join('');
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
        {ticks.map((v) => (
          <g key={v}>
            <line className="chart-grid" x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} />
            <text className="chart-tick" x={M.left - 6} y={y(v)} dy="0.32em" textAnchor="end">{tickLabel(v)}</text>
          </g>
        ))}
        <text className="chart-tick" x={M.left} y={height - 4}>{day(t0)}</text>
        <text className="chart-tick" x={width - M.right} y={height - 4} textAnchor="end">{day(t1)}</text>

        {shown.map((l) => (
          <line key={l.label} className={`chart-ref chart-ref-${l.kind}`} x1={M.left} x2={width - M.right} y1={y(l.value)} y2={y(l.value)} />
        ))}

        {area && <path className="chart-area" d={`${path}L${x(last.t).toFixed(1)},${M.top + h}L${x(points[0].t).toFixed(1)},${M.top + h}Z`} />}
        <path className="chart-line" d={path} />
        {/* Labels go on top of the line so their outline keeps them readable */}
        {shown.map((l) => (
          <text key={l.label} className="chart-ref-label" x={width - M.right - 2} y={y(l.value) - 4} textAnchor="end">{l.label}</text>
        ))}
        {/* Readings the crew entered themselves get a marker; simulated history stays a plain line */}
        {points.map((p, i) => p.source !== 'simulated' && (
          <circle key={i} className="chart-dot" cx={x(p.t)} cy={y(p.value)} r={4} />
        ))}
        <circle className="chart-dot" cx={x(last.t)} cy={y(last.value)} r={4} />

        {a && (
          <g>
            <line className="chart-cross" x1={x(a.t)} x2={x(a.t)} y1={M.top} y2={M.top + h} />
            <circle className="chart-dot chart-dot-active" cx={x(a.t)} cy={y(a.value)} r={5} />
          </g>
        )}
      </svg>
      {a && (
        <div className="chart-tip" style={flip ? { right: width - tipLeft + 10 } : { left: tipLeft + 10 }}>
          <strong>{format(a.value)}</strong>
          <span className="muted">{day(a.t)}</span>
          <SourceTag source={a.source} />
        </div>
      )}
    </div>
  );
}
