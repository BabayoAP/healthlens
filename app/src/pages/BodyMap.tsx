import { useState, type KeyboardEvent } from 'react';
import { FIGURE_REGIONS, SYSTEM_INFO, type FigureRegion, type FigureRegionId } from '../lib/bodyRegions';
import { GUIDES } from '../lib/guides';
import { formatValue } from '../lib/indicators';
import { evaluateAstronaut, worst, type IndicatorEval, type Reason } from '../lib/status';
import { readingsFor, useData } from '../lib/store';
import type { SkinScan, Status } from '../lib/types';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';
import { TrendChart } from '../components/TrendChart';

const DAY = 86_400_000;

/** Figure shapes, drawn facing the viewer: the person's left side is on the viewer's right. */
const SHAPES: Record<FigureRegionId, { d: string; labelAt: [number, number] }> = {
  head: { d: 'M100 8c13 0 22 10.5 22 25c0 10-4.5 18-11 22.5V68H89V55.5C82.5 51 78 43 78 33c0-14.5 9-25 22-25Z', labelAt: [100, 34] },
  chest: { d: 'M70 74h60c12 0 20 8 21 19l1 59H48l1-59c1-11 9-19 21-19Z', labelAt: [100, 115] },
  abdomen: { d: 'M51 156h98l1 44c0 10-2 19-5 26H55c-3-7-5-16-5-26Z', labelAt: [100, 192] },
  'right-arm': { d: 'M38 80c5 0 8 4 8 10l-2 72l-4 62c-.5 6-3.5 10-8 10s-7.5-4-7.5-10l1-62l3-72c.4-6 4.5-10 9.5-10Z', labelAt: [35, 165] },
  'left-arm': { d: 'M162 80c-5 0-8 4-8 10l2 72l4 62c.5 6 3.5 10 8 10s7.5-4 7.5-10l-1-62l-3-72c-.4-6-4.5-10-9.5-10Z', labelAt: [165, 165] },
  'right-leg': { d: 'M56 230h40l-3 84l-4 68c-.4 7-5 11-11 11s-10.6-4-11-11l-4-68l-7-84Z', labelAt: [77, 300] },
  'left-leg': { d: 'M144 230h-40l3 84l4 68c.4 7 5 11 11 11s10.6-4 11-11l4-68l7-84Z', labelAt: [123, 300] },
};

const STATUS_WORD: Record<Status, string> = { ok: 'OK', watch: 'Watch', act: 'Act' };
const MARK: Record<Status, string> = { ok: '✓', watch: '!', act: '!!' };

interface RegionView {
  region: FigureRegion;
  status?: Status;
  indicators: IndicatorEval[];
  /** Symptoms reported for the body systems of this part */
  symptoms: Reason[];
  /** Latest scan of each skin area in this region */
  scans: SkinScan[];
}

export function BodyMap({ astronautId, onNavigate }: { astronautId: string; onNavigate: (tab: 'check-in' | 'skin' | 'tests' | 'trends' | 'guides') => void }) {
  const data = useData();
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);

  const views: RegionView[] = FIGURE_REGIONS.map((region) => {
    const systems = [region.system, ...(region.also ?? [])];
    const indicators = ev.indicators.filter((i) => systems.includes(i.def.system) && i.latest);
    const symptoms = ev.reasons.filter((r) => r.kind === 'symptom' && r.system !== undefined && systems.includes(r.system));
    const scans = region.skin.flatMap((area) => {
      const all = data.skinScans.filter((s) => s.astronautId === astronautId && s.region === area);
      return all.length ? [all.reduce((a, b) => (a.takenAt > b.takenAt ? a : b))] : [];
    });
    const statuses = [...indicators.map((i) => i.status), ...symptoms.map((r) => r.status), ...scans.flatMap((s) => s.lesions.map((l) => l.risk))];
    const hasAny = indicators.length > 0 || scans.length > 0 || symptoms.length > 0;
    return { region, indicators, symptoms, scans, status: hasAny ? statuses.reduce<Status>((a, b) => worst(a, b), 'ok') : undefined };
  });

  // Start on the part that most needs attention
  const rank = (s?: Status) => (s === 'act' ? 0 : s === 'watch' ? 1 : 2);
  const firstFlagged = [...views].sort((a, b) => rank(a.status) - rank(b.status))[0].region.id;
  const [picked, setPicked] = useState<FigureRegionId>();
  const selectedId = picked ?? firstFlagged;
  const selected = views.find((v) => v.region.id === selectedId)!;
  const info = SYSTEM_INFO[selected.region.system]!;

  const flagged = selected.indicators.filter((i) => i.status !== 'ok');
  const guides = GUIDES.filter((g) => flagged.some((i) => g.indicators.includes(i.def.id)));
  const flaggedSpots = selected.scans.flatMap((s) => s.lesions.filter((l) => l.risk !== 'ok').map((l) => ({ scan: s, lesion: l })));
  const skinGuide = GUIDES.find((g) => g.id === 'skin')!;
  const symptomGuide = GUIDES.find((g) => g.id === 'symptoms')!;
  const focus = flagged[0] ?? selected.indicators[0];

  // A part flagged only because of its skin leads with the skin finding
  const skinFirst = flaggedSpots.length > 0 && flagged.length === 0;
  const focusWatch = focus?.def.baseline
    ? (focus.def.baseline.pct ? ((focus.baseline ?? focus.latest!.value) * focus.def.baseline.watch) / 100 : focus.def.baseline.watch)
    : 0;

  const measurementsBlock = (
    <>
          {selected.indicators.length > 0 ? (
            <table>
              <thead><tr><th>Measurement</th><th>Latest</th><th>Your baseline</th><th>Status</th></tr></thead>
              <tbody>
                {selected.indicators.map((i) => (
                  <tr key={i.def.id}>
                    <td>{i.def.label}</td>
                    <td>{formatValue(i.def, i.latest!.value)} <SourceTag source={i.latest!.source} /></td>
                    <td>{i.baseline !== undefined ? formatValue(i.def, i.baseline) : '—'}</td>
                    <td><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">No measurements for this system yet.</p>}

          {[...selected.symptoms, ...flagged.flatMap((i) => i.reasons)].map((r) => <p className={`chart-reason reason-${r.status}`} key={r.text}>{r.text}</p>)}

          {focus && (
            <>
              <h4>{focus.def.label}, last 6 weeks</h4>
              <TrendChart
                label={`${focus.def.label}, last 6 weeks`}
                points={readingsFor(data, astronautId, focus.def.id)
                  .map((r) => ({ t: Date.parse(r.takenAt), value: r.value, source: r.source }))
                  .filter((p) => p.t >= data.now - 42 * DAY)}
                format={(v) => formatValue(focus.def, v)}
                lines={focus.baseline !== undefined ? [{ value: focus.baseline, label: 'your baseline', kind: 'baseline' }] : []}
                from={data.now - 42 * DAY} to={data.now} height={130} minSpan={focusWatch * 2.5}
              />
            </>
          )}
    </>
  );

  const skinBlock = (
    <>
          <h4>Skin in this area</h4>
          {selected.scans.length === 0 ? (
            <p className="muted">No skin scan of this area yet.</p>
          ) : (
            <ul className="plain">
              {selected.scans.map((s) => (
                <li key={s.id}>
                  {s.region.replace('-', ' ')}, scanned {s.takenAt.slice(0, 10)} <SourceTag source={s.source} />:{' '}
                  {s.lesions.length === 0 ? 'no spots found' : s.lesions.map((l) => `${l.diameterMm} mm ${l.change} spot`).join(', ')}
                </li>
              ))}
            </ul>
          )}
          {flaggedSpots.map(({ scan, lesion }) => (
            <p className={`chart-reason reason-${lesion.risk}`} key={lesion.id}>
              {scan.region.replace('-', ' ')}: {lesion.change} spot, {lesion.diameterMm} mm ({lesion.notes.join(', ')})
            </p>
          ))}
    </>
  );

  const onKey = (id: FigureRegionId) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked(id); }
  };

  return (
    <section>
      <h2>Body map</h2>
      <p className="muted">Select a part of the body to see how it is doing, why it changes in space, and what to do.</p>

      <div className="bodymap">
        <div className="figure-wrap">
          <svg viewBox="0 0 200 410" className="figure" role="group" aria-label="Body figure, facing you">
            {views.map(({ region, status }) => {
              const [lx, ly] = SHAPES[region.id].labelAt;
              return (
                <g
                  key={region.id} role="button" tabIndex={0}
                  aria-label={`${region.label}: ${SYSTEM_INFO[region.system]!.title}. ${status ? STATUS_WORD[status] : 'No data yet'}`}
                  aria-pressed={selectedId === region.id}
                  className={`region region-${status ?? 'none'}${selectedId === region.id ? ' region-selected' : ''}`}
                  onClick={() => setPicked(region.id)} onKeyDown={onKey(region.id)}
                >
                  <path d={SHAPES[region.id].d} />
                  {/* Status is never shown by color alone: flagged parts also carry a mark */}
                  {status && status !== 'ok' && <text x={lx} y={ly} textAnchor="middle" dy="0.35em">{MARK[status]}</text>}
                </g>
              );
            })}
          </svg>
          <ul className="region-list">
            {views.map(({ region, status }) => (
              <li key={region.id}>
                <button type="button" className={selectedId === region.id ? 'active' : ''} onClick={() => setPicked(region.id)}>
                  <span>{region.label}</span>
                  {status ? <StatusBadge status={status} /> : <span className="muted">no data</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel region-detail" aria-live="polite">
          <div className="panel-head">
            <h3>{selected.region.label}: {info.title}</h3>
            {selected.status && <StatusBadge status={selected.status} />}
          </div>
          <p>{info.does}</p>

          {skinFirst ? <>{skinBlock}{measurementsBlock}</> : <>{measurementsBlock}{skinBlock}</>}

          <h4>Why this changes in space</h4>
          {skinFirst && <p>{skinGuide.why}</p>}
          <p>{info.inSpace}</p>
          {selected.region.also?.map((sys) => <p key={sys}>{SYSTEM_INFO[sys]!.inSpace}</p>)}
          {flaggedSpots.length > 0 && !skinFirst && <p>{skinGuide.why}</p>}

          <h4>What you can do</h4>
          {guides.length === 0 && flaggedSpots.length === 0 && selected.symptoms.length === 0 && <p>Nothing here needs attention. Keep up your regular checks.</p>}
          {guides.map((g) => (
            <div key={g.id}>
              <ol>{g.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol>
              <p><strong>When to contact the medical officer:</strong> {g.escalate}</p>
            </div>
          ))}
          {selected.symptoms.length > 0 && (
            <div>
              <ol>{symptomGuide.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol>
              <p><strong>When to contact the medical officer:</strong> {symptomGuide.escalate}</p>
            </div>
          )}
          {flaggedSpots.length > 0 && (
            <div>
              <ol>{skinGuide.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol>
              <p><strong>When to contact the medical officer:</strong> {skinGuide.escalate}</p>
            </div>
          )}

          <div className="row detail-nav">
            <button type="button" className="ghost" onClick={() => onNavigate('check-in')}>Log a check-in</button>
            <button type="button" className="ghost" onClick={() => onNavigate('tests')}>Vision and reaction tests</button>
            <button type="button" className="ghost" onClick={() => onNavigate('skin')}>Scan skin</button>
            <button type="button" className="ghost" onClick={() => onNavigate('trends')}>All trends</button>
            <button type="button" className="ghost" onClick={() => onNavigate('guides')}>Measurement guides</button>
          </div>
        </div>
      </div>
    </section>
  );
}
