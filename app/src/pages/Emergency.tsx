import { useEffect, useMemo, useState } from 'react';
import { crew } from '../lib/mockData';
import { EMERGENCY_GUIDES, PRIORITY_INFO, byPriority, emergencyById, suggestEmergencies, type Priority } from '../lib/emergency';
import { environmentById } from '../lib/environment';
import { SOURCES } from '../lib/sources';
import { useData } from '../lib/store';

interface LogEntry { at: number; step: string; note?: string }

const clock = (t: number) => new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const mmss = (ms: number) => `${Math.floor(ms / 60_000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

/**
 * Emergency guides sorted by priority, with guides suggested by the crew's own data on top.
 * A guide runs one step per screen with an elapsed timer and an event log the crew can copy into a
 * report for the ground, adjusted for the comm delay of the current environment.
 */
export function Emergency({ initialGuide }: { initialGuide?: string }) {
  const data = useData();
  const env = environmentById[data.environment];
  const [guideId, setGuideId] = useState<string | undefined>(initialGuide);
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [note, setNote] = useState('');
  const [tick, setTick] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  const guide = guideId ? emergencyById[guideId] : undefined;

  useEffect(() => {
    if (!guide) return;
    const t = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [guide]);

  const suggestions = useMemo(
    () => suggestEmergencies(crew.map((c) => c.id), data.readings, data.symptomLogs, Date.now()),
    [data.readings, data.symptomLogs],
  );

  function open(id: string) {
    setGuideId(id);
    setStep(0);
    setStartedAt(Date.now());
    setTick(Date.now());
    setLog([]);
    setNote('');
    setCopied(false);
  }

  const comm = (
    <p className={`comm ${env.liveHelp ? '' : 'comm-delayed'}`}>
      <strong>{env.label}.</strong> Signal delay to Earth: {env.commDelay} each way. {env.helpAdvice}
    </p>
  );

  if (!guide) {
    const q = query.trim().toLowerCase();
    const shown = byPriority(EMERGENCY_GUIDES.filter((g) => !q || [g.title, g.when, ...g.signs].join(' ').toLowerCase().includes(q)));
    const groups = ([1, 2, 3] as Priority[]).map((p) => ({ p, guides: shown.filter((g) => g.priority === p) })).filter((g) => g.guides.length);
    const name = (id: string) => crew.find((c) => c.id === id)?.name ?? id;

    return (
      <section className="emergency">
        <h2>Emergency</h2>
        {comm}

        {suggestions.length > 0 && (
          <div className="panel em-suggest" role="alert">
            <h3>Suggested from today's check-ins</h3>
            <ul>
              {suggestions.map((s) => (
                <li key={`${s.guide.id}-${s.astronautId}`}>
                  <button type="button" className={`em-suggest-btn em-p${s.guide.priority}`} onClick={() => open(s.guide.id)}>
                    <strong>{s.guide.title}</strong>
                    <span>{name(s.astronautId)}: {s.why}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="em-search">
          <input
            type="search" placeholder="What is happening? Try “breathing”, “burn”, “eye”…" aria-label="Find an emergency guide"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {groups.map(({ p, guides }) => (
          <div className={`em-group em-p${p}`} key={p}>
            <h3 className="em-group-head"><span className="em-chip">{p}</span> {PRIORITY_INFO[p].label} <span className="muted">· {PRIORITY_INFO[p].action}</span></h3>
            <div className="em-grid">
              {guides.map((g) => (
                <button key={g.id} type="button" className="card emergency-pick" onClick={() => open(g.id)}>
                  <strong>{g.title}</strong>
                  <p className="muted">{g.when}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="muted">No guide matches “{query}”. Clear the search to see all {EMERGENCY_GUIDES.length}.</p>}

        <p className="muted">Reference steps for this demo, sorted by how fast to act. They do not replace mission medical procedures or trained judgment.</p>
      </section>
    );
  }

  const steps = guide.steps(env);
  const s = steps[step];
  const last = step === steps.length - 1;

  function advance(to: number) {
    setLog((l) => [...l, { at: Date.now(), step: s.title, note: note.trim() || undefined }]);
    setNote('');
    setStep(to);
  }

  function report(entries: LogEntry[]) {
    return [
      `HealthLens emergency log: ${guide!.title} (priority ${guide!.priority}, ${PRIORITY_INFO[guide!.priority].label.toLowerCase()})`,
      `Location: ${env.label}. Started ${new Date(startedAt).toLocaleString()}.`,
      ...entries.map((e) => `${clock(e.at)}  ${e.step}${e.note ? `: ${e.note}` : ''}`),
      'Reference steps only; not a diagnosis.',
    ].join('\n');
  }

  async function finish() {
    const entries = [...log, { at: Date.now(), step: s.title, note: note.trim() || undefined }];
    setLog(entries);
    setNote('');
    try { await navigator.clipboard.writeText(report(entries)); setCopied(true); } catch { setCopied(false); }
    setStep(steps.length);
  }

  if (step >= steps.length) {
    return (
      <section className="emergency">
        <h2>{guide.title}: all steps done</h2>
        {comm}
        <div className="panel">
          <div className="panel-head"><h3>Event log</h3><span className="muted">{copied ? 'Copied for the ground report' : 'Select and copy for the ground report'}</span></div>
          <pre className="em-report">{report(log)}</pre>
        </div>
        <div className="row step-nav">
          <button type="button" className="ghost" onClick={() => setStep(steps.length - 1)}>Back to last step</button>
          <button type="button" className="primary" onClick={() => setGuideId(undefined)}>All emergencies</button>
        </div>
      </section>
    );
  }

  return (
    <section className="emergency">
      <h2><span className={`em-tag em-p${guide.priority}`}>{PRIORITY_INFO[guide.priority].label}</span> {guide.title}</h2>
      {comm}
      <div className="em-run">
        <div>
          <div className="panel step" aria-live="polite">
            <div className="panel-head">
              <p className="muted">Step {step + 1} of {steps.length}</p>
              <p className="em-timer" aria-label="Time since this guide was opened">{mmss(Math.max(0, tick - startedAt))}</p>
            </div>
            <div className="em-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
            <h3>{s.title}</h3>
            <p className="step-detail">{s.detail}</p>
            {s.log && (
              <label className="step-log">
                <span><strong>Write down:</strong> {s.log}</span>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type it here, it goes in the event log" />
              </label>
            )}
          </div>
          <div className="row step-nav">
            <button type="button" className="ghost" onClick={() => (step === 0 ? setGuideId(undefined) : setStep(step - 1))}>
              {step === 0 ? 'All emergencies' : 'Back'}
            </button>
            {last
              ? <button type="button" className="primary" onClick={finish}>Done: copy the event log</button>
              : <button type="button" className="primary" onClick={() => advance(step + 1)}>Next step</button>}
          </div>
        </div>

        <aside className="em-side">
          <div className="panel">
            <h4>Is this it?</h4>
            <ul className="em-list">{guide.signs.map((x) => <li key={x}>{x}</li>)}</ul>
            {guide.doNot && (<><h4>Do not</h4><ul className="em-list em-donot">{guide.doNot.map((x) => <li key={x}>{x}</li>)}</ul></>)}
          </div>
          <div className="panel">
            <h4>All steps</h4>
            <ol className="em-steps">
              {steps.map((x, i) => (
                <li key={x.title} className={i < step ? 'done' : i === step ? 'now' : ''}>
                  <button type="button" onClick={() => setStep(i)}>{x.title}</button>
                </li>
              ))}
            </ol>
            {log.length > 0 && (
              <>
                <h4>Event log</h4>
                <ul className="em-log">{log.map((e, i) => <li key={i}><span className="muted">{clock(e.at)}</span> {e.step}{e.note ? `: ${e.note}` : ''}</li>)}</ul>
              </>
            )}
            <p className="muted em-sources">Based on: {guide.sources.map((id) => SOURCES[id].org).filter((v, i, a) => a.indexOf(v) === i).join('; ')}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
