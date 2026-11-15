import { crew } from '../lib/mockData';
import { evaluateAstronaut, nextStep } from '../lib/status';
import { useData } from '../lib/store';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';

export function Dashboard({ onOpen }: { onOpen: (id: string) => void }) {
  const data = useData();
  return (
    <section>
      <h2>Crew status</h2>
      <div className="grid">
        {crew.map((a) => {
          const ev = evaluateAstronaut(a.id, data.readings, data.skinScans, data.now);
          const due = ev.indicators.filter((i) => i.due && i.latest).length;
          return (
            <button key={a.id} className="card" onClick={() => onOpen(a.id)}>
              <div className="card-head">
                <div>
                  <strong>{a.name}</strong>
                  <div className="muted">{a.role} · Day {a.missionDay} · {a.radiationMSv} mSv <SourceTag source="estimated" /></div>
                </div>
                {ev.hasData && <StatusBadge status={ev.status} />}
              </div>
              {!ev.hasData ? (
                <p className="muted">No data yet. Log a check-in to start a baseline.</p>
              ) : ev.headlines.length > 0 ? (
                <ul>
                  {ev.headlines.map((r) => (
                    <li key={r.text} className={`reason-${r.status}`}>
                      {r.text} {r.source && <SourceTag source={r.source} />}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">All indicators within your baseline.</p>
              )}
              {ev.hasData && <p className="next">{nextStep[ev.status]}</p>}
              {due > 0 && <p className="muted">{due} check{due > 1 ? 's' : ''} due today</p>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
