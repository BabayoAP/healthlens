import type { CheckTab } from '../lib/guides';
import { crew } from '../lib/mockData';
import { buildReminders, needsDoing } from '../lib/reminders';
import { evaluateAstronaut, nextStep } from '../lib/status';
import { useData } from '../lib/store';
import type { Status } from '../lib/types';
import { RemindersPanel } from '../components/RemindersPanel';
import { SourceTag } from '../components/SourceTag';
import { SpaceWeatherPanel } from '../components/SpaceWeatherPanel';
import { StatusBadge } from '../components/StatusBadge';

const NBSP = String.fromCharCode(160);
const list = (names: string[]) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

/** One plain sentence per status group, worst first: the first thing anyone reads. */
function crewSummary(groups: Record<Status, string[]>): { status: Status; text: string }[] {
  const out: { status: Status; text: string }[] = [];
  if (groups.act.length) out.push({ status: 'act', text: `${list(groups.act)} ${groups.act.length > 1 ? 'need' : 'needs'} action today.` });
  if (groups.watch.length) out.push({ status: 'watch', text: `${list(groups.watch)} ${groups.watch.length > 1 ? 'are' : 'is'} on watch.` });
  if (groups.ok.length) out.push({ status: 'ok', text: groups.act.length + groups.watch.length === 0 ? 'Everyone is within their baseline.' : `${list(groups.ok)} ${groups.ok.length > 1 ? 'are' : 'is'} clear.` });
  return out;
}

export function Dashboard({ onOpen, onOpenCheck, onOpenStormGuide }: { onOpen: (id: string) => void; onOpenCheck: (id: string, tab: CheckTab) => void; onOpenStormGuide: () => void }) {
  const data = useData();
  const rows = crew.map((a) => {
    const ev = evaluateAstronaut(a.id, data.readings, data.skinScans, data.now, data.symptomLogs);
    const due = buildReminders(a.id, ev, data.skinScans, data.now).filter(needsDoing).length;
    return { a, ev, due };
  });
  const groups: Record<Status, string[]> = { act: [], watch: [], ok: [] };
  // Non-breaking spaces keep each name on one line in the headline
  for (const { a, ev } of rows) if (ev.hasData) groups[ev.status].push(a.name.replace(/ /g, NBSP));
  const summary = crewSummary(groups);
  const date = new Date(data.now).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <section className="dashboard">
      <header className="page-head">
        <p className="page-meta">{date}, mission day {crew[0].missionDay}</p>
        <h2>Crew overview</h2>
      </header>

      {summary.length > 0 && (
        <p className="crew-summary">
          {summary.map((s) => <span key={s.status} className={`summary-${s.status}`}>{s.text} </span>)}
        </p>
      )}

      <div className="dash-layout">
        <div className="crew-grid">
          {rows.map(({ a, ev, due }) => (
            <button key={a.id} type="button" className={`crew-card crew-card-${ev.hasData ? ev.status : 'none'}`} onClick={() => onOpen(a.id)}>
              <div className="crew-card-head">
                <span className="avatar avatar-lg" aria-hidden="true">{a.name.split(' ').pop()![0]}</span>
                <div className="crew-card-who">
                  <strong>{a.name}</strong>
                  <span className="muted">{a.role}</span>
                </div>
                {ev.hasData && <StatusBadge status={ev.status} />}
              </div>

              {!ev.hasData ? (
                <p className="muted">No data yet. Log a check-in to start a baseline.</p>
              ) : ev.headlines.length > 0 ? (
                <ul className="findings">
                  {ev.headlines.map((r) => (
                    <li key={r.text} className={`finding finding-${r.status}`}>
                      <span>{r.text}</span>
                      {(r.source === 'simulated' || r.source === 'estimated') && <SourceTag source={r.source} />}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">All indicators within baseline.</p>
              )}

              {ev.hasData && <p className="next">{nextStep[ev.status]}</p>}

              <dl className="crew-stats">
                <div><dt>Mission day</dt><dd>{a.missionDay}</dd></div>
                <div><dt>Dose <SourceTag source="estimated" /></dt><dd>{a.radiationMSv} mSv</dd></div>
                <div><dt>Checks due</dt><dd className={due > 0 ? 'due-now' : ''}>{due}</dd></div>
              </dl>
            </button>
          ))}
        </div>

        <aside className="dash-side">
          <RemindersPanel onOpen={onOpenCheck} />
          <SpaceWeatherPanel onOpenStormGuide={onOpenStormGuide} />
        </aside>
      </div>
    </section>
  );
}
