import { crew, skinScans, vitals } from '../lib/mockData';
import { nextStep, skinStatus, vitalsStatus, worst } from '../lib/status';
import { StatusBadge } from '../components/StatusBadge';

export function Dashboard({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section>
      <h2>Crew status</h2>
      <div className="grid">
        {crew.map((a) => {
          const v = vitalsStatus(vitals.filter((r) => r.astronautId === a.id));
          const s = skinStatus(skinScans.filter((x) => x.astronautId === a.id));
          const status = worst(v.status, s.status);
          const reasons = [...s.reasons, ...v.reasons];
          return (
            <button key={a.id} className="card" onClick={() => onOpen(a.id)}>
              <div className="card-head">
                <div>
                  <strong>{a.name}</strong>
                  <div className="muted">{a.role} · Day {a.missionDay} · {a.radiationMSv} mSv</div>
                </div>
                <StatusBadge status={status} />
              </div>
              {reasons.length > 0 ? (
                <ul>{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              ) : (
                <p className="muted">All indicators within baseline.</p>
              )}
              <p className="next">{nextStep[status]}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
