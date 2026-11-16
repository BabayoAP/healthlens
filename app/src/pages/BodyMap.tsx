import { lazy, Suspense, useState } from 'react';
import { SYSTEM_INFO, type FigureRegionId } from '../lib/bodyRegions';
import { buildRegionViews } from '../lib/bodyView';
import { GUIDES } from '../lib/guides';
import { evaluateAstronaut } from '../lib/status';
import type { Status } from '../lib/types';
import { useData } from '../lib/store';
import { BodyFigure } from '../components/BodyFigure';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';
import { IndicatorList } from '../components/IndicatorList';

// three.js is only downloaded when someone opens the 3D view
const BodyFigure3D = lazy(() => import('../components/BodyFigure3D'));
const canWebGL = (() => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
})();

export function BodyMap({ astronautId, initialRegion, onNavigate }: { astronautId: string; initialRegion?: FigureRegionId; onNavigate: (tab: 'check-in' | 'skin' | 'tests' | 'trends' | 'guides') => void }) {
  const data = useData();
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);

  const views = buildRegionViews(astronautId, ev, data.skinScans);

  // Start on the part that most needs attention
  const rank = (s?: Status) => (s === 'act' ? 0 : s === 'watch' ? 1 : 2);
  const firstFlagged = [...views].sort((a, b) => rank(a.status) - rank(b.status))[0].region.id;
  const [picked, setPicked] = useState<FigureRegionId | undefined>(initialRegion);
  const selectedId = picked ?? firstFlagged;
  const [view, setView] = useState<'3d' | '2d'>(canWebGL ? '3d' : '2d');
  const selected = views.find((v) => v.region.id === selectedId)!;
  const info = SYSTEM_INFO[selected.region.system]!;

  const flagged = selected.indicators.filter((i) => i.status !== 'ok');
  const flaggedSpots = selected.scans.flatMap((s) => s.lesions.filter((l) => l.risk !== 'ok').map((l) => ({ scan: s, lesion: l })));
  const skinGuide = GUIDES.find((g) => g.id === 'skin')!;
  const symptomGuide = GUIDES.find((g) => g.id === 'symptoms')!;

  // A part flagged only because of its skin leads with the skin finding
  const skinFirst = flaggedSpots.length > 0 && flagged.length === 0;

  const measurementsBlock = (
    <>
          <IndicatorList astronautId={astronautId} indicators={selected.indicators} />

          {selected.symptoms.map((r) => <p className={`chart-reason reason-${r.status}`} key={r.text}>{r.text}</p>)}

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

  return (
    <section>
      <h2>Body map</h2>
      <p className="muted">Select a part of the body to see how it is doing, why it changes in space, and what to do.</p>

      <div className="bodymap">
        <div className="figure-wrap">
          {canWebGL && (
            <div className="range view-toggle" role="group" aria-label="Figure view">
              <button type="button" className={view === '3d' ? 'active' : ''} aria-pressed={view === '3d'} onClick={() => setView('3d')}>3D</button>
              <button type="button" className={view === '2d' ? 'active' : ''} aria-pressed={view === '2d'} onClick={() => setView('2d')}>2D</button>
            </div>
          )}
          {view === '3d' ? (
            <Suspense fallback={<BodyFigure views={views} selectedId={selectedId} onPick={setPicked} />}>
              <BodyFigure3D views={views} selectedId={selectedId} onPick={setPicked} onUnavailable={() => setView('2d')} />
            </Suspense>
          ) : (
            <BodyFigure views={views} selectedId={selectedId} onPick={setPicked} />
          )}
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

          <details className="fold region-fold">
            <summary>Why this changes in space</summary>
            {skinFirst && <p>{skinGuide.why}</p>}
            <p>{info.inSpace}</p>
            {selected.region.also?.map((sys) => <p key={sys}>{SYSTEM_INFO[sys]!.inSpace}</p>)}
            {flaggedSpots.length > 0 && !skinFirst && <p>{skinGuide.why}</p>}
          </details>

          {flagged.length === 0 && flaggedSpots.length === 0 && selected.symptoms.length === 0 && <p className="muted">Nothing here needs attention. Keep up your regular checks.</p>}
          {(flaggedSpots.length > 0 || selected.symptoms.length > 0) && <h4>What you can do</h4>}
          {selected.symptoms.length > 0 && (
            <div>
              <ol>{symptomGuide.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol>
              <details className="fold"><summary>When to contact the medical officer</summary><p>{symptomGuide.escalate}</p></details>
            </div>
          )}
          {flaggedSpots.length > 0 && (
            <div>
              <ol>{skinGuide.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol>
              <details className="fold"><summary>When to contact the medical officer</summary><p>{skinGuide.escalate}</p></details>
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
