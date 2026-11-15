import { useState } from 'react';
import { formatValue } from '../lib/indicators';
import { evaluateAstronaut } from '../lib/status';
import { readingsFor, useData } from '../lib/store';
import { referenceLines, spotHistories, watchSize } from '../lib/trends';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';
import { TrendChart, type TrendPoint } from '../components/TrendChart';
import { TrendExplorer } from '../components/TrendExplorer';

const DAY = 86_400_000;
const RANGES = [{ days: 14, label: '2 weeks' }, { days: 42, label: '6 weeks' }];

export function Trends({ astronautId }: { astronautId: string }) {
  const data = useData();
  const [days, setDays] = useState(42);
  const from = data.now - days * DAY;
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);
  const spots = spotHistories(data.skinScans.filter((s) => s.astronautId === astronautId));
  const rangeLabel = RANGES.find((r) => r.days === days)!.label;

  return (
    <section>
      <h2>Trends</h2>
      <TrendExplorer key={astronautId} astronautId={astronautId} title="Explore a measure" />

      <h3>All measurements</h3>
      <div className="row range" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button key={r.days} type="button" aria-pressed={days === r.days} className={days === r.days ? 'active' : ''} onClick={() => setDays(r.days)}>
            Last {r.label}
          </button>
        ))}
      </div>

      {!ev.hasData && <p className="muted">No data yet. Log a check-in to start your trends.</p>}

      {spots.length > 0 && (
        <>
          <h3>Skin spots</h3>
          <div className="chart-grid-layout">
            {spots.map((s, i) => (
              <div className="panel" key={s.id}>
                <div className="panel-head">
                  <h4>Spot on {s.region.replace('-', ' ')} #{i + 1}: size</h4>
                  <StatusBadge status={s.latest.risk} />
                </div>
                <p className="chart-latest">
                  <strong>{s.latest.diameterMm} mm</strong>
                  <span className="muted"> was {s.points[0].value} mm at first scan</span>
                </p>
                <TrendChart
                  label={`Size of spot on ${s.region}, all scans`}
                  points={s.points} format={(v) => `${Number(v.toFixed(1))} mm`}
                  lines={[{ value: 6, label: 'over 6 mm: get it checked', kind: 'watch' }]} minSpan={4}
                />
                <p className="muted">{s.latest.notes.join(' · ')}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {ev.hasData && <h3>Measurements</h3>}
      <div className="chart-grid-layout">
        {ev.indicators.filter((i) => i.latest).map((i) => {
          const all = readingsFor(data, astronautId, i.def.id);
          const points: TrendPoint[] = all
            .map((r) => ({ t: Date.parse(r.takenAt), value: r.value, source: r.source }))
            .filter((p) => p.t >= from);
          const format = (v: number) => formatValue(i.def, v);
          return (
            <div className="panel" key={i.def.id}>
              <div className="panel-head">
                <h4>{i.def.label}</h4>
                <StatusBadge status={i.status} />
              </div>
              <p className="chart-latest">
                <strong>{format(i.latest!.value)}</strong> <SourceTag source={i.latest!.source} />
                {i.baseline !== undefined && <span className="muted"> baseline {format(i.baseline)}</span>}
              </p>
              <TrendChart
                label={`${i.def.label}, last ${rangeLabel}`}
                points={points} format={format} lines={referenceLines(i.def, i)} from={from} to={data.now} minSpan={watchSize(i) * 2.5}
              />
              {i.reasons.map((r) => <p className={`chart-reason reason-${r.status}`} key={r.text}>{r.text}</p>)}
              <details className="chart-table">
                <summary>Show as table</summary>
                <table>
                  <thead><tr><th>Date</th><th>Value</th><th>Source</th></tr></thead>
                  <tbody>
                    {all.filter((r) => Date.parse(r.takenAt) >= from).reverse().map((r) => (
                      <tr key={r.id}><td>{r.takenAt.slice(0, 10)}</td><td>{format(r.value)}</td><td><SourceTag source={r.source} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          );
        })}
      </div>
    </section>
  );
}
