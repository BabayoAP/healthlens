import { useState } from 'react';
import { environmentById } from '../lib/environment';
import { buildInsights, buildReport } from '../lib/insights';
import { crew } from '../lib/mockData';
import { buildReminders } from '../lib/reminders';
import { CheckSchedule } from '../components/CheckSchedule';
import { evaluateAstronaut, nextStep } from '../lib/status';
import { useData } from '../lib/store';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';
import { IndicatorTrend } from '../components/IndicatorList';
import { TrendChart } from '../components/TrendChart';
import { spotHistories } from '../lib/trends';

type Target = 'check-in' | 'skin' | 'tests' | 'trends' | 'guides';

/** What the data means and what to do about it: one card per finding, plus the check schedule and a report. */
export function Insights({ astronautId, onNavigate }: { astronautId: string; onNavigate: (tab: Target) => void }) {
  const data = useData();
  const env = environmentById[data.environment];
  const astronaut = crew.find((a) => a.id === astronautId)!;
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);
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
      <p className="muted">Most urgent first · {env.label}</p>

      {!ev.hasData ? (
        <p className="panel">No data yet. Log a check-in to start a baseline.</p>
      ) : insights.length === 0 ? (
        <div className="panel insight">
          <div className="panel-head"><h3>Nothing flagged</h3><StatusBadge status="ok" /></div>
          <p>All indicators are within your baseline. {nextStep.ok}</p>
        </div>
      ) : (
        <div className="insight-list">
          {insights.map((ins) => {
            // Chart the measurement behind the first finding; skin findings chart the spot's size
            const ind = ev.indicators.find((i) => i.def.id === ins.saw.find((r) => r.indicator)?.indicator);
            const spot = ins.id === 'skin' ? spotHistories(data.skinScans.filter((x) => x.astronautId === astronautId)).find((h) => h.latest.risk !== 'ok') : undefined;
            const [first, ...more] = ins.todo;
            return (
              <article className={`panel insight insight-${ins.status}`} key={ins.id}>
                <div className="insight-text">
                  <div className="panel-head">
                    <h3>{ins.title}</h3>
                    <StatusBadge status={ins.status} />
                  </div>
                  {ins.saw.map((r) => (
                    <p className="insight-saw" key={r.text}>
                      {r.text} {(r.source === 'simulated' || r.source === 'estimated') && <SourceTag source={r.source} />}
                    </p>
                  ))}
                  <p className="insight-do"><span>{ins.onlyMissing ? 'Measure' : 'Do'}</span>{first}</p>
                  <div className="folds">
                    {more.length > 0 && <details className="fold"><summary>{more.length} more {more.length > 1 ? 'steps' : 'step'}</summary><ol start={2}>{more.map((x) => <li key={x}>{x}</li>)}</ol></details>}
                    <details className="fold"><summary>Why it matters in space</summary><p>{ins.why}</p></details>
                    <details className="fold"><summary>When to get help</summary><p>{ins.escalate}</p></details>
                  </div>
                  <div className="row insight-actions">
                    <button type="button" className="ghost" onClick={() => onNavigate(ins.tab)}>{ins.tab === 'skin' ? 'Scan again' : ins.id === 'symptoms' ? 'Update symptoms' : ins.tab === 'tests' ? (ins.onlyMissing ? 'Take the test' : 'Test again') : ins.onlyMissing ? 'Measure now' : 'Measure again'}</button>
                    <button type="button" className="link" onClick={() => onNavigate('guides')}>Guide and sources</button>
                  </div>
                </div>
                {ind?.latest && !ins.onlyMissing && (
                  <div className="insight-chart"><IndicatorTrend astronautId={astronautId} ind={ind} days={21} height={150} /></div>
                )}
                {spot && (
                  <div className="insight-chart">
                    <TrendChart label="Spot size over time" points={spot.points} format={(v) => `${Number(v.toFixed(1))} mm`}
                      lines={[{ value: 6, label: 'over 6 mm: get it checked', kind: 'watch' }]} minSpan={4} height={150} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <h3>Check schedule</h3>
      <CheckSchedule astronautId={astronautId} reminders={reminders} onDo={onNavigate} />

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
