import { useState } from 'react';
import { environmentById } from '../lib/environment';
import { buildInsights, buildReport } from '../lib/insights';
import { crew } from '../lib/mockData';
import { buildReminders, cadenceText, dueText } from '../lib/reminders';
import { evaluateAstronaut, nextStep } from '../lib/status';
import { useData } from '../lib/store';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';

type Target = 'check-in' | 'skin' | 'trends' | 'guides';

/** What the data means and what to do about it: one card per finding, plus the check schedule and a report. */
export function Insights({ astronautId, onNavigate }: { astronautId: string; onNavigate: (tab: Target) => void }) {
  const data = useData();
  const env = environmentById[data.environment];
  const astronaut = crew.find((a) => a.id === astronautId)!;
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now);
  const insights = buildInsights(ev, env);
  const reminders = buildReminders(astronautId, ev, data.skinScans, data.now);
  const report = buildReport(astronaut, ev, insights, env, data.now);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch { setCopied(false); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthlens-report-${astronaut.id}-day${astronaut.missionDay}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <h2>Insights for {astronaut.name}</h2>
      <p className="muted">What the data shows, why it matters in space, what to do, and when to get help. Set for: {env.label}.</p>

      {!ev.hasData ? (
        <p className="panel">No data yet. Log a check-in to start a baseline.</p>
      ) : insights.length === 0 ? (
        <div className="panel insight">
          <div className="panel-head"><h3>Nothing flagged</h3><StatusBadge status="ok" /></div>
          <p>All indicators are within your baseline. {nextStep.ok}</p>
        </div>
      ) : (
        insights.map((ins) => (
          <article className={`panel insight insight-${ins.status}`} key={ins.id}>
            <div className="panel-head">
              <h3>{ins.title}</h3>
              <span className="row"><span className="hazard">{ins.hazard}</span><StatusBadge status={ins.status} /></span>
            </div>

            <h4>What we saw</h4>
            <ul>
              {ins.saw.map((r) => (
                <li key={r.text}>
                  {r.text} {(r.source === 'simulated' || r.source === 'estimated') && <SourceTag source={r.source} />}
                </li>
              ))}
            </ul>

            <h4>Why it matters in space</h4>
            <p>{ins.why}</p>

            <h4>{ins.onlyMissing ? 'What to do: take the measurement' : 'What to do'}</h4>
            <ol>{ins.todo.map((s) => <li key={s}>{s}</li>)}</ol>

            <h4>When to get help</h4>
            <p>{ins.escalate}</p>

            <div className="row detail-nav">
              <button type="button" className="ghost" onClick={() => onNavigate(ins.tab)}>{ins.tab === 'skin' ? 'Scan again' : ins.onlyMissing ? 'Measure now' : 'Measure again'}</button>
              <button type="button" className="ghost" onClick={() => onNavigate('trends')}>See the trend</button>
              <button type="button" className="ghost" onClick={() => onNavigate('guides')}>Full guide and sources</button>
            </div>
          </article>
        ))
      )}

      <h3>Check schedule</h3>
      <table>
        <thead><tr><th>Check</th><th>How often</th><th>Last done</th><th>Next</th><th></th></tr></thead>
        <tbody>
          {reminders.map((r) => (
            <tr key={r.id}>
              <td>{r.label}</td>
              <td>{cadenceText(r.cadenceDays)}</td>
              <td>{r.daysSince === undefined ? 'never' : r.daysSince === 0 ? 'today' : `${r.daysSince} d ago`}</td>
              <td className={r.state === 'upcoming' ? 'muted' : 'due-now'}>{dueText(r)}</td>
              <td>{r.state !== 'upcoming' && <button type="button" className="ghost" onClick={() => onNavigate(r.tab)}>Do it now</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Report for the flight surgeon</h3>
      <p className="muted">A plain-text summary of the findings above and the latest readings, ready to send at the next comm window (signal delay here: {env.commDelay}).</p>
      <div className="row">
        <button type="button" className="primary" onClick={copy}>Copy report</button>
        <button type="button" className="ghost" onClick={download}>Download .txt</button>
        <span className="muted" role="status">{copied ? 'Copied.' : ''}</span>
      </div>
      <details className="chart-table">
        <summary>Preview report</summary>
        <pre className="report">{report}</pre>
      </details>
    </section>
  );
}
