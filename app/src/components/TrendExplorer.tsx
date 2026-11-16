import { useEffect, useRef, useState } from 'react';
import { SYSTEM_INFO } from '../lib/bodyRegions';
import { formatValue } from '../lib/indicators';
import { evaluateAstronaut } from '../lib/status';
import { readingsFor, useData } from '../lib/store';
import { referenceLines, spotHistories, watchSize } from '../lib/trends';
import type { Status } from '../lib/types';
import { SourceTag } from './SourceTag';
import { StatusBadge } from './StatusBadge';
import { TrendChart, type TrendLine, type TrendPoint } from './TrendChart';

const DAY = 86_400_000;
const RANGES = [{ days: 7, label: '1W' }, { days: 14, label: '2W' }, { days: 42, label: '6W' }, { days: 0, label: 'All' }];

interface Series {
  key: string;
  label: string;
  group: string;
  status: Status;
  points: TrendPoint[];
  format: (v: number) => string;
  lines: TrendLine[];
  baseline?: number;
  minSpan: number;
  reasons: { text: string; status: Status }[];
}

/**
 * One large chart for one astronaut, with filters: which measure, which time range,
 * and whether to show the personal baseline and the safety limits.
 */
export function TrendExplorer({ astronautId, title = 'Health trends' }: { astronautId: string; title?: string }) {
  const data = useData();
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);

  const spots = spotHistories(data.skinScans.filter((s) => s.astronautId === astronautId));
  const series: Series[] = [
    ...spots.map((s, i): Series => ({
      key: `spot:${s.id}`, label: `Skin spot ${i + 1}, ${s.region.replace('-', ' ')} (size)`, group: 'Skin', status: s.latest.risk,
      points: s.points, format: (v) => `${Number(v.toFixed(1))} mm`,
      lines: [{ value: 6, label: 'over 6 mm: get it checked', kind: 'watch' }], minSpan: 4,
      reasons: s.latest.risk === 'ok' ? [] : [{ text: s.latest.notes.join(', '), status: s.latest.risk }],
    })),
    ...ev.indicators.filter((i) => i.latest).map((i): Series => ({
      key: `ind:${i.def.id}`, label: i.def.label, group: SYSTEM_INFO[i.def.system]?.title ?? i.def.system, status: i.status,
      points: readingsFor(data, astronautId, i.def.id).map((r) => ({ t: Date.parse(r.takenAt), value: r.value, source: r.source })),
      format: (v) => formatValue(i.def, v), lines: referenceLines(i.def, i), baseline: i.baseline,
      minSpan: watchSize(i) * 2.5, reasons: i.reasons,
    })),
  ];

  // Open on whatever most needs attention
  const rank: Record<Status, number> = { act: 0, watch: 1, ok: 2 };
  const firstFlagged = [...series].sort((a, b) => rank[a.status] - rank[b.status])[0]?.key;
  const [picked, setPicked] = useState<string>();
  const [days, setDays] = useState(0);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showLimits, setShowLimits] = useState(true);
  // The chart takes whatever height its slot gives it (it fills the row on the dashboard), never less than 240px
  const hasSeries = series.length > 0;
  const slot = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(240);
  useEffect(() => {
    const el = slot.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setChartHeight(Math.max(240, Math.floor(e.contentRect.height))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasSeries]);

  if (series.length === 0) {
    return (
      <div className="panel explorer">
        <div className="panel-head"><h3>{title}</h3></div>
        <p className="muted">No measurements yet. Log a check-in to start a trend.</p>
      </div>
    );
  }

  const s = series.find((x) => x.key === picked) ?? series.find((x) => x.key === firstFlagged)!;
  const from = days ? data.now - days * DAY : Math.min(...s.points.map((p) => p.t));
  const points = s.points.filter((p) => p.t >= from);
  const lines = s.lines.filter((l) => (l.kind === 'baseline' ? showBaseline : showLimits));
  const values = points.map((p) => p.value);
  const change = points.length > 1 ? points[points.length - 1].value - points[0].value : undefined;
  const groups = [...new Set(series.map((x) => x.group))];
  const latest = s.points[s.points.length - 1];

  return (
    <div className="panel explorer">
      <div className="explorer-head">
        <h3>{title}</h3>
        <div className="explorer-filters">
          <label className="select-label">
            <span className="sr-only">Measure</span>
            <select value={s.key} onChange={(e) => setPicked(e.target.value)}>
              {groups.map((g) => (
                <optgroup key={g} label={g}>
                  {series.filter((x) => x.group === g).map((x) => (
                    <option key={x.key} value={x.key}>{x.label}{x.status !== 'ok' ? ` (${x.status === 'act' ? 'Act' : 'Watch'})` : ''}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="range" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button key={r.label} type="button" aria-pressed={days === r.days} className={days === r.days ? 'active' : ''} onClick={() => setDays(r.days)}>
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" className={`chip${showBaseline ? ' on' : ''}`} aria-pressed={showBaseline} onClick={() => setShowBaseline(!showBaseline)}>Baseline</button>
          <button type="button" className={`chip${showLimits ? ' on' : ''}`} aria-pressed={showLimits} onClick={() => setShowLimits(!showLimits)}>Limits</button>
        </div>
      </div>

      <div className="explorer-stats">
        <div className="stat stat-main">
          <span className="stat-label">{s.label} <StatusBadge status={s.status} /></span>
          <span className="stat-value">{s.format(latest.value)} <SourceTag source={latest.source} /></span>
        </div>
        {s.baseline !== undefined && <div className="stat"><span className="stat-label">Your baseline</span><span className="stat-value">{s.format(s.baseline)}</span></div>}
        {values.length > 0 && <div className="stat"><span className="stat-label">Lowest</span><span className="stat-value">{s.format(Math.min(...values))}</span></div>}
        {values.length > 0 && <div className="stat"><span className="stat-label">Highest</span><span className="stat-value">{s.format(Math.max(...values))}</span></div>}
        {change !== undefined && (
          <div className="stat"><span className="stat-label">Change in period</span>
            <span className="stat-value">{change > 0 ? '+' : change < 0 ? '−' : ''}{s.format(Math.abs(change))}</span>
          </div>
        )}
      </div>

      <div className="explorer-chart" ref={slot}>
      <TrendChart
        key={s.key} label={`${s.label}, ${days ? `last ${days} days` : 'all readings'}`}
        points={points} format={s.format} lines={lines} from={from} to={data.now} minSpan={s.minSpan} height={chartHeight}
      />
      </div>
      {s.reasons.map((r) => <p className={`chart-reason reason-${r.status}`} key={r.text}>{r.text}</p>)}
    </div>
  );
}
