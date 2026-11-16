import { useState, type ReactNode } from 'react';
import { environmentById } from '../lib/environment';
import { formatValue, indicatorById } from '../lib/indicators';
import { evaluateAstronaut, nextStep } from '../lib/status';
import { addReadings, useData } from '../lib/store';
import type { IndicatorId, Reading } from '../lib/types';
import { StatusBadge } from '../components/StatusBadge';
import { SymptomChecklist } from '../components/SymptomChecklist';
import { IndicatorList } from '../components/IndicatorList';
import { DeviceSync } from '../components/DeviceSync';

/** Number fields. min/max only catch typos (a heart rate of 700); they are not medical ranges. */
const NUMBER_FIELDS: { id: IndicatorId; min: number; max: number; step: number; typical: number; hint?: string }[] = [
  { id: 'heartRate', min: 20, max: 250, step: 1, typical: 64, hint: 'Rest for 5 minutes first' },
  { id: 'systolic', min: 50, max: 260, step: 1, typical: 118 },
  { id: 'diastolic', min: 30, max: 160, step: 1, typical: 74 },
  { id: 'spo2', min: 50, max: 100, step: 1, typical: 98 },
  { id: 'respRate', min: 2, max: 60, step: 1, typical: 14, hint: 'Breaths in 30 s, doubled' },
  { id: 'glucose', min: 20, max: 600, step: 1, typical: 88, hint: 'Weekly, before breakfast' },
  { id: 'temperature', min: 30, max: 44, step: 0.1, typical: 36.6 },
  { id: 'bodyMass', min: 30, max: 200, step: 0.1, typical: 75, },
  { id: 'sleepHours', min: 0, max: 24, step: 0.1, typical: 7.4, hint: 'Hours slept last night' },
];

const SCALES: { id: IndicatorId; low: string; high: string }[] = [
  { id: 'mood', low: 'very low', high: 'great' },
  { id: 'stress', low: 'calm', high: 'very stressed' },
  { id: 'fatigue', low: 'rested', high: 'exhausted' },
];

type Draft = Partial<Record<IndicatorId, string>>;

export function CheckIn({ astronautId }: { astronautId: string }) {
  const data = useData();
  const [draft, setDraft] = useState<Draft>({});
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<IndicatorId[]>([]);

  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);
  const evalOf = (id: IndicatorId) => ev.indicators.find((i) => i.def.id === id)!;
  const env = environmentById[data.environment];

  function set(id: IndicatorId, value: string) {
    setDraft((d) => ({ ...d, [id]: value }));
    setError(undefined);
  }

  function save() {
    const filled = Object.entries(draft).filter(([, v]) => v !== undefined && v.trim() !== '') as [IndicatorId, string][];
    if (filled.length === 0) return setError('Nothing to save yet. Fill in at least one value.');
    const has = (id: IndicatorId) => filled.some(([k]) => k === id);
    if (has('systolic') !== has('diastolic')) return setError('Blood pressure needs both numbers (for example 118 over 74).');

    const takenAt = new Date().toISOString();
    const readings: Omit<Reading, 'id'>[] = [];
    for (const [id, text] of filled) {
      const def = indicatorById[id];
      const value = Number(text);
      const f = NUMBER_FIELDS.find((x) => x.id === id);
      const [min, max] = f ? [f.min, f.max] : [1, 5];
      if (!Number.isFinite(value) || value < min || value > max) {
        return setError(`${def.label}: ${text} doesn't look right. Expected a number between ${min} and ${max}.`);
      }
      readings.push({ astronautId, indicator: id, value, takenAt, source: def.entrySource });
    }
    if (has('systolic') && Number(draft.diastolic) >= Number(draft.systolic)) {
      return setError('The first blood pressure number (systolic) should be the larger one.');
    }
    addReadings(readings);
    setSaved(filled.map(([id]) => id));
    setDraft({});
    setError(undefined);
  }

  /** Last value as a hint under the field, plus the measuring tip if there is one */
  const hintFor = (id: IndicatorId) => {
    const def = indicatorById[id];
    const last = evalOf(id).latest;
    const f = NUMBER_FIELDS.find((x) => x.id === id)!;
    return [last && `last ${formatValue(def, last.value)}`, f.hint].filter(Boolean).join(' · ');
  };

  const input = (id: IndicatorId, label: string) => {
    const f = NUMBER_FIELDS.find((x) => x.id === id)!;
    return (
      <input
        type="number" inputMode="decimal" min={f.min} max={f.max} step={f.step} aria-label={label}
        value={draft[id] ?? ''} onChange={(e) => set(id, e.target.value)} placeholder="—"
      />
    );
  };

  const tile = (id: IndicatorId, extra?: ReactNode) => {
    const def = indicatorById[id];
    return (
      <div className="tile-input" key={id}>
        <span className="field-label">{def.label}</span>
        <span className="tile-row">{input(id, def.label)}{def.unit && <span className="tile-unit">{def.unit}</span>}</span>
        <span className="tile-hint">{hintFor(id)}</span>
        {extra}
      </div>
    );
  };

  return (
    <section>
      <h2>Check-in {ev.hasData && <StatusBadge status={ev.status} />}</h2>
      <p className="muted">Sync your devices, or fill in what you measured by hand. Blank fields are skipped.</p>

      <DeviceSync astronautId={astronautId} onImported={(ids) => { setSaved([...new Set(ids)]); setError(undefined); }} />

      <div className="checkin">
        <div className="panel">
          <div className="panel-head">
            <h3>Vitals by hand</h3>
          </div>
          <div className="tile-grid">
            {tile('heartRate')}
            <div className="tile-input">
              <span className="field-label">Blood pressure</span>
              <span className="tile-row tile-bp">
                {input('systolic', 'Blood pressure, top number (systolic)')}<span className="tile-sep">/</span>{input('diastolic', 'Blood pressure, bottom number (diastolic)')}
                <span className="tile-unit">mmHg</span>
              </span>
              <span className="tile-hint">{evalOf('systolic').latest && evalOf('diastolic').latest ? `last ${evalOf('systolic').latest!.value}/${evalOf('diastolic').latest!.value}` : 'top / bottom number'}</span>
            </div>
            {tile('spo2')}
            {tile('respRate')}
            {tile('temperature')}
            {tile('glucose')}
            {tile('bodyMass', <details className="fold"><summary>How to weigh here</summary><p>Weekly. {env.massMethod}</p></details>)}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>How are you today?</h3></div>
          <div className="tile-grid">{tile('sleepHours')}</div>
          {SCALES.map(({ id, low, high }) => (
            <div className="scale-field" key={id} role="group" aria-label={indicatorById[id].label}>
              <span className="field-label">{indicatorById[id].label.replace(' (1–5)', '')}</span>
              <span className="scale5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button" key={n} aria-pressed={draft[id] === String(n)}
                    className={draft[id] === String(n) ? 'active' : ''} onClick={() => set(id, String(n))}
                  >{n}</button>
                ))}
              </span>
              <span className="scale-ends"><span>{low}</span><span>{high}</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="save-bar">
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="button" className="primary" onClick={save}>Save check-in</button>
      </div>

      {saved.length > 0 && (
        <div className="panel result" aria-live="polite">
          <div className="panel-head">
            <h3>Saved</h3>
            <StatusBadge status={ev.status} />
          </div>
          <p className="muted">{nextStep[ev.status]} Open a row for its trend and what to do.</p>
          <IndicatorList astronautId={astronautId} indicators={saved.map(evalOf)} />
        </div>
      )}

      <SymptomChecklist astronautId={astronautId} />
    </section>
  );
}
