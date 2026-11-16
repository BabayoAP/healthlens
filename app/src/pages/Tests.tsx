import { useCallback, useEffect, useRef, useState } from 'react';
import { guideFor } from '../lib/guides';
import { formatValue } from '../lib/indicators';
import { evaluateAstronaut } from '../lib/status';
import { addReading, addReadings, useData } from '../lib/store';
import type { IndicatorId } from '../lib/types';
import { IndicatorList } from '../components/IndicatorList';

/**
 * Tests the app runs itself (PRD §5.0, §5.6): near-vision chart, Amsler grid, reaction time.
 * Results are saved as `measured-in-app` and judged only against the crew member's own baseline
 * (see `basis` for each indicator in `indicators.ts`): the screen is not a calibrated instrument.
 */

/** What the saved results mean, as the same indicator rows used everywhere else (open one for trend and next steps). */
function Result({ astronautId, ids }: { astronautId: string; ids: IndicatorId[] }) {
  const data = useData();
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);
  return (
    <div className="test-result" aria-live="polite">
      <span className="field-label">Saved</span>
      <IndicatorList astronautId={astronautId} indicators={ev.indicators.filter((i) => ids.includes(i.def.id) && i.latest)} />
    </div>
  );
}

/** Card header: name, how long it takes, and the latest result with its status, so the card says where you stand before you start. */
function TestHead({ astronautId, title, minutes, ids }: { astronautId: string; title: string; minutes: string; ids: IndicatorId[] }) {
  const data = useData();
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);
  const last = ev.indicators.filter((i) => ids.includes(i.def.id) && i.latest);
  return (
    <div className="test-head">
      <div>
        <h3>{title}</h3>
        <span className="muted">{minutes}</span>
      </div>
      <div className="test-last">
        {last.map((i) => (
          <span key={i.def.id} className="test-last-item">
            <span className={`status-dot status-dot-${i.status}`} aria-hidden="true" />
            {last.length > 1 && <span className="muted">{i.def.label.replace(/ \(.*\)/, '')}</span>}
            {formatValue(i.def, i.latest!.value)}
            <span className="muted">{i.daysSince === 0 ? 'today' : `${i.daysSince} d ago`}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- Reaction time ----------

const TRIES = 5;
type ReactionPhase = 'idle' | 'waiting' | 'go' | 'early' | 'done';

function ReactionTest({ astronautId }: { astronautId: string }) {
  const [phase, setPhase] = useState<ReactionPhase>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const shownAt = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const arm = () => {
    setPhase('waiting');
    // Random wait so the green light cannot be anticipated
    timer.current = window.setTimeout(() => { shownAt.current = performance.now(); setPhase('go'); }, 1500 + Math.random() * 2500);
  };

  const press = () => {
    if (phase === 'idle' || phase === 'done') { setTimes([]); arm(); return; }
    if (phase === 'early') { arm(); return; }
    if (phase === 'waiting') { window.clearTimeout(timer.current); setPhase('early'); return; }
    const next = [...times, performance.now() - shownAt.current];
    setTimes(next);
    if (next.length < TRIES) { arm(); return; }
    const median = [...next].sort((a, b) => a - b)[Math.floor(TRIES / 2)];
    addReading({ astronautId, indicator: 'reactionTime', value: Math.round(median), takenAt: new Date().toISOString(), source: 'measured-in-app' });
    setPhase('done');
  };

  const text: Record<ReactionPhase, string> = {
    idle: 'Start', waiting: 'Wait…', go: 'TAP!', early: 'Too early. Tap to retry', done: 'Run again',
  };
  const guide = guideFor('reactionTime')!;

  return (
    <div className="panel">
      <TestHead astronautId={astronautId} title="Reaction time" minutes="about 30 seconds" ids={['reactionTime']} />
      <details className="fold"><summary>How it works</summary><ol>{guide.how({} as never).map((s) => <li key={s}>{s}</li>)}</ol></details>
      <button
        type="button" className={`reaction reaction-${phase}`}
        onPointerDown={(e) => { e.preventDefault(); press(); }}
        onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); } }}
      >{text[phase]}</button>
      <p className="muted" role="status">
        {phase === 'idle' ? `${TRIES} tries.` : `Try ${Math.min(times.length + (phase === 'done' ? 0 : 1), TRIES)} of ${TRIES}`}
        {times.length > 0 && <> · {times.map((t) => `${Math.round(t)} ms`).join(', ')}</>}
      </p>
      {phase === 'done' && <Result astronautId={astronautId} ids={['reactionTime']} />}
    </div>
  );
}

// ---------- Vision ----------

/** Height of the letter E on each chart row, in CSS pixels. Three letters per row; two right moves on. */
const ROWS = [56, 44, 34, 26, 20, 15, 11, 8];
const DIRECTIONS = ['up', 'right', 'down', 'left'] as const;
type Direction = typeof DIRECTIONS[number];
const ANGLE: Record<Direction, number> = { right: 0, down: 90, left: 180, up: 270 };
const ARROW: Record<Direction, string> = { up: '↑', right: '→', down: '↓', left: '←' };
const KEY: Record<string, Direction> = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left' };
const randomDirection = (not?: Direction): Direction => {
  const options = DIRECTIONS.filter((d) => d !== not);
  return options[Math.floor(Math.random() * options.length)];
};

type VisionStep = 'intro' | 'chart' | 'amsler-right' | 'amsler-left' | 'done';

function AmslerGrid() {
  const lines = Array.from({ length: 21 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 300 300" className="amsler" role="img" aria-label="Amsler grid: a square grid of straight lines with a dot in the center">
      {lines.map((p) => <g key={p}><line x1={p} y1={0} x2={p} y2={300} /><line x1={0} y1={p} x2={300} y2={p} /></g>)}
      <circle cx={150} cy={150} r={5} />
    </svg>
  );
}

function VisionCheck({ astronautId }: { astronautId: string }) {
  const [step, setStep] = useState<VisionStep>('intro');
  const [row, setRow] = useState(0);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [direction, setDirection] = useState<Direction>('right');
  const [rowsRead, setRowsRead] = useState(0);
  const [distortedEyes, setDistortedEyes] = useState(0);
  const guide = guideFor('nearVision')!;

  const start = () => {
    setRow(0); setRight(0); setWrong(0); setDistortedEyes(0); setDirection(randomDirection()); setStep('chart');
  };

  const answer = useCallback((d: Direction | 'unsure') => {
    const r = right + (d === direction ? 1 : 0);
    const w = wrong + (d === direction ? 0 : 1);
    if (w >= 2 || (r >= 2 && row === ROWS.length - 1)) {
      setRowsRead(r >= 2 ? row + 1 : row);
      setStep('amsler-right');
    } else if (r >= 2) {
      setRow(row + 1); setRight(0); setWrong(0);
    } else {
      setRight(r); setWrong(w);
    }
    setDirection(randomDirection(direction));
  }, [direction, right, wrong, row]);

  useEffect(() => {
    if (step !== 'chart') return;
    const onKey = (e: KeyboardEvent) => {
      const d = KEY[e.key];
      if (d) { e.preventDefault(); answer(d); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, answer]);

  const amsler = (distorted: boolean) => {
    const total = distortedEyes + (distorted ? 1 : 0);
    if (step === 'amsler-right') { setDistortedEyes(total); setStep('amsler-left'); return; }
    const takenAt = new Date().toISOString();
    addReadings([
      { astronautId, indicator: 'nearVision', value: rowsRead, takenAt, source: 'measured-in-app' },
      { astronautId, indicator: 'amsler', value: total, takenAt, source: 'measured-in-app' },
    ]);
    setStep('done');
  };

  return (
    <div className="panel">
      <TestHead astronautId={astronautId} title="Vision check" minutes="about 1 minute" ids={['nearVision', 'amsler']} />

      {(step === 'intro' || step === 'done') && (
        <>
          <details className="fold"><summary>How it works</summary><ol>{guide.how({} as never).map((s) => <li key={s}>{s}</li>)}</ol></details>
          <button type="button" className="primary test-start" onClick={start}>{step === 'done' ? 'Run again' : 'Start vision check'}</button>
        </>
      )}

      {step === 'chart' && (
        <>
          <p className="muted" role="status">Part 1 of 2: near-vision chart · row {row + 1} of {ROWS.length}. Which way does the E point?</p>
          <div className="optotype">
            <svg viewBox="0 0 5 5" width={ROWS[row]} height={ROWS[row]} role="img" aria-label="Letter E, turned in one of four directions" style={{ transform: `rotate(${ANGLE[direction]}deg)` }}>
              <path d="M0 0h5v1H1v1h4v1H1v1h4v1H0z" />
            </svg>
          </div>
          <div className="arrow-pad">
            {DIRECTIONS.map((d) => (
              <button type="button" key={d} className={`arrow arrow-${d}`} aria-label={`Points ${d}`} onClick={() => answer(d)}>{ARROW[d]}</button>
            ))}
          </div>
          <button type="button" className="ghost" onClick={() => answer('unsure')}>I can't tell</button>
          <p className="muted">Arrow keys work too.</p>
        </>
      )}

      {(step === 'amsler-right' || step === 'amsler-left') && (
        <>
          <p role="status">
            Part 2 of 2: Amsler grid. <strong>Cover your {step === 'amsler-right' ? 'left' : 'right'} eye</strong> and look at the center dot
            with your {step === 'amsler-right' ? 'right' : 'left'} eye. Keep looking at the dot.
          </p>
          <AmslerGrid />
          <p>Do any lines look wavy, blurred, dark or missing?</p>
          <div className="row">
            <button type="button" className="primary" onClick={() => amsler(false)}>No, all lines look straight</button>
            <button type="button" className="ghost" onClick={() => amsler(true)}>Yes, some lines look wrong</button>
          </div>
        </>
      )}

      {step === 'done' && <Result astronautId={astronautId} ids={['nearVision', 'amsler']} />}
    </div>
  );
}

export function Tests({ astronautId }: { astronautId: string }) {
  return (
    <section>
      <h2>Tests</h2>
      <p className="muted">Compared only with your own earlier results, not a clinical scale.</p>
      <div className="checkin">
        <VisionCheck astronautId={astronautId} />
        <ReactionTest astronautId={astronautId} />
      </div>
    </section>
  );
}
