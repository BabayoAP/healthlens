import { useState } from 'react';
import { formatValue, indicatorById } from '../lib/indicators';
import { evaluateAstronaut, nextStep } from '../lib/status';
import { addReadings, readingsFor, useData } from '../lib/store';
import type { IndicatorId, Reading } from '../lib/types';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';

/** Number fields. min/max only catch typos (a heart rate of 700); they are not medical ranges. */
const NUMBER_FIELDS: { id: IndicatorId; min: number; max: number; step: number; typical: number; hint?: string }[] = [
  { id: 'heartRate', min: 20, max: 250, step: 1, typical: 64, hint: 'Rest for 5 minutes first' },
  { id: 'systolic', min: 50, max: 260, step: 1, typical: 118 },
  { id: 'diastolic', min: 30, max: 160, step: 1, typical: 74 },
  { id: 'spo2', min: 50, max: 100, step: 1, typical: 98 },
  { id: 'temperature', min: 30, max: 44, step: 0.1, typical: 36.6 },
  { id: 'bodyMass', min: 30, max: 200, step: 0.1, typical: 75, hint: 'Weekly. In microgravity use the mass-measuring device, not a scale' },
  { id: 'sleepHours', min: 0, max: 24, step: 0.1, typical: 7.4, hint: 'Hours slept last night' },
];
const VITALS: IndicatorId[] = ['heartRate', 'systolic', 'diastolic', 'spo2', 'temperature', 'bodyMass'];

const SCALES: { id: IndicatorId; low: string; high: string }[] = [
  { id: 'mood', low: 'very low', high: 'great' },
  { id: 'stress', low: 'calm', high: 'very stressed' },
  { id: 'fatigue', low: 'rested', high: 'exhausted' },
];

type Draft = Partial<Record<IndicatorId, string>>;

export function CheckIn({ astronautId }: { astronautId: string }) {
  const data = useData();
  const [draft, setDraft] = useState<Draft>({});
  /** Fields filled by "Simulate reading". Typing in a field clears its flag. */
  const [simulated, setSimulated] = useState<Partial<Record<IndicatorId, boolean>>>({});
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<IndicatorId[]>([]);

  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now);
  const evalOf = (id: IndicatorId) => ev.indicators.find((i) => i.def.id === id)!;

  function set(id: IndicatorId, value: string) {
    setDraft((d) => ({ ...d, [id]: value }));
    setSimulated((s) => ({ ...s, [id]: false }));
    setError(undefined);
  }

  /** Fills the vitals with a plausible reading near this astronaut's recent values. Saved with the `simulated` tag. */
  function simulate() {
    const next: Draft = { ...draft };
    const flags = { ...simulated };
    for (const f of NUMBER_FIELDS.filter((x) => VITALS.includes(x.id))) {
      const history = readingsFor(data, astronautId, f.id);
      const around = history.length ? history[history.length - 1].value : f.typical;
      const wobble = (Math.random() * 2 - 1) * f.step * 2;
      next[f.id] = (around + wobble).toFixed(indicatorById[f.id].decimals);
      flags[f.id] = true;
    }
    setDraft(next);
    setSimulated(flags);
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
      readings.push({ astronautId, indicator: id, value, takenAt, source: simulated[id] ? 'simulated' : def.entrySource });
    }
    if (has('systolic') && Number(draft.diastolic) >= Number(draft.systolic)) {
      return setError('The first blood pressure number (systolic) should be the larger one.');
    }
    addReadings(readings);
    setSaved(filled.map(([id]) => id));
    setDraft({});
    setSimulated({});
    setError(undefined);
  }

  const numberInput = (id: IndicatorId, label?: string) => {
    const f = NUMBER_FIELDS.find((x) => x.id === id)!;
    const def = indicatorById[id];
    const last = evalOf(id).latest;
    return (
      <label className="field" key={id}>
        <span className="field-label">
          {label ?? def.label} {simulated[id] && <SourceTag source="simulated" />}
        </span>
        <span className="field-input">
          <input
            type="number" inputMode="decimal" min={f.min} max={f.max} step={f.step}
            value={draft[id] ?? ''} onChange={(e) => set(id, e.target.value)}
            placeholder={last ? `last ${last.value.toFixed(def.decimals)}` : ''}
          />
          {def.unit && <span className="muted">{def.unit}</span>}
        </span>
        {f.hint && <span className="muted">{f.hint}</span>}
      </label>
    );
  };

  return (
    <section>
      <h2>Check-in {ev.hasData && <StatusBadge status={ev.status} />}</h2>
      <p className="muted">Fill in what you measured. Anything left blank is skipped.</p>

      <div className="form-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Vitals</h3>
            <button type="button" className="ghost" onClick={simulate} title="No device connected yet. Fills in a made-up reading, saved with a 'simulated' tag.">
              Simulate reading
            </button>
          </div>
          {numberInput('heartRate')}
          <div className="field-pair">
            {numberInput('systolic', 'Blood pressure: top number')}
            {numberInput('diastolic', 'Bottom number')}
          </div>
          {numberInput('spo2')}
          {numberInput('temperature')}
          {numberInput('bodyMass')}
          <p className="muted">Device connects here: readings from a cuff, oximeter or wearable will fill these in automatically.</p>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>How are you today?</h3></div>
          {numberInput('sleepHours')}
          {SCALES.map(({ id, low, high }) => (
            <div className="field" key={id} role="group" aria-label={indicatorById[id].label}>
              <span className="field-label">{indicatorById[id].label.replace(' (1–5)', '')}</span>
              <span className="scale">
                <span className="muted">{low}</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button" key={n} aria-pressed={draft[id] === String(n)}
                    className={draft[id] === String(n) ? 'active' : ''} onClick={() => set(id, String(n))}
                  >{n}</button>
                ))}
                <span className="muted">{high}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="button" className="primary" onClick={save}>Save check-in</button>

      {saved.length > 0 && (
        <div className="panel result" aria-live="polite">
          <div className="panel-head">
            <h3>Saved. Here is what it means</h3>
            <StatusBadge status={ev.status} />
          </div>
          <table>
            <thead><tr><th>Indicator</th><th>You entered</th><th>Your baseline</th><th>Status</th><th>Why</th></tr></thead>
            <tbody>
              {saved.map((id) => {
                const i = evalOf(id);
                return (
                  <tr key={id}>
                    <td>{i.def.label}</td>
                    <td>{i.latest && <>{formatValue(i.def, i.latest.value)} <SourceTag source={i.latest.source} /></>}</td>
                    <td>{i.baseline !== undefined ? formatValue(i.def, i.baseline) : 'building…'}</td>
                    <td><StatusBadge status={i.status} /></td>
                    <td>{i.reasons.length ? i.reasons.map((r) => <div key={r.text}>{r.text}</div>) : 'Within your normal range'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="next">{nextStep[ev.status]}</p>
        </div>
      )}
    </section>
  );
}
