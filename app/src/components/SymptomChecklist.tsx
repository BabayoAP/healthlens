import { useState } from 'react';
import { GUIDES } from '../lib/guides';
import { evaluateAstronaut } from '../lib/status';
import { addSymptomLog, useData } from '../lib/store';
import { SYMPTOM_GROUPS, activeSymptomLog, symptomById } from '../lib/symptoms';
import { SourceTag } from './SourceTag';
import { StatusBadge } from './StatusBadge';

const guide = GUIDES.find((g) => g.id === 'symptoms')!;

/** Daily symptom tap list (PRD §5.4). Saved as a self-report; the rules are in `lib/symptoms.ts`. */
export function SymptomChecklist({ astronautId }: { astronautId: string }) {
  const data = useData();
  const [picked, setPicked] = useState<string[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  const logs = data.symptomLogs.filter((l) => l.astronautId === astronautId);
  const active = activeSymptomLog(logs, data.now);
  const reasons = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs)
    .reasons.filter((r) => r.kind === 'symptom');

  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setJustSaved(false);
  };
  const save = (symptoms: string[]) => {
    addSymptomLog({ astronautId, symptoms, takenAt: new Date().toISOString(), source: 'self-report' });
    setPicked([]);
    setJustSaved(true);
  };

  return (
    <div className="panel symptoms">
      <div className="panel-head">
        <h3>Any symptoms today?</h3>
        <SourceTag source="self-report" />
      </div>
      <p className="muted">
        Tap anything you have noticed since your last check-in.
        {active && <> Last saved {active.takenAt.slice(0, 10)}: {active.symptoms.length ? active.symptoms.map((id) => symptomById[id]?.label ?? id).join(', ') : 'none'}.</>}
      </p>

      <div className="symptom-groups">
        {SYMPTOM_GROUPS.map((g) => (
          <div key={g.title} role="group" aria-label={g.title}>
            <span className="field-label">{g.title}</span>
            <div className="chip-row">
              {g.symptoms.map((s) => (
                <button type="button" key={s.id} className={`chip${picked.includes(s.id) ? ' on' : ''}`} aria-pressed={picked.includes(s.id)} onClick={() => toggle(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <button type="button" className="primary" disabled={picked.length === 0} onClick={() => save(picked)}>
          Save {picked.length || ''} symptom{picked.length === 1 ? '' : 's'}
        </button>
        <button type="button" className="ghost" onClick={() => save([])}>No symptoms today</button>
      </div>

      {justSaved && (
        <div className="todo" aria-live="polite">
          {reasons.length === 0 ? (
            <p>Saved: no symptoms today. <StatusBadge status="ok" /></p>
          ) : (
            <>
              {reasons.map((r) => (
                <p className={`chart-reason reason-${r.status}`} key={r.text}>{r.text}</p>
              ))}
              <div className="folds">
                <details className="fold"><summary>What to do</summary><ol>{guide.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol></details>
                <details className="fold"><summary>When to get help</summary><p>{guide.escalate}</p></details>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
