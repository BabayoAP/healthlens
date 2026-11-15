import { formatValue } from '../lib/indicators';
import { evaluateAstronaut } from '../lib/status';
import { useData } from '../lib/store';
import { SourceTag } from '../components/SourceTag';
import { StatusBadge } from '../components/StatusBadge';

// TODO (other tasks): entry forms, trend charts, guide cards. This page lists every indicator
// from the registry with its latest value, personal baseline and status.
export function Vitals({ astronautId }: { astronautId: string }) {
  const data = useData();
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now);
  const rows = ev.indicators;

  return (
    <section>
      <h2>Indicators</h2>
      <table>
        <thead>
          <tr><th>Indicator</th><th>Latest</th><th>Your baseline</th><th>Last measured</th><th>Status</th><th>Why</th></tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.def.id}>
              <td>{i.def.label}</td>
              <td>{i.latest ? <>{formatValue(i.def, i.latest.value)} <SourceTag source={i.latest.source} /></> : '—'}</td>
              <td>{i.baseline !== undefined ? formatValue(i.def, i.baseline) : '—'}</td>
              <td>
                {i.daysSince === undefined ? 'never' : i.daysSince === 0 ? 'today' : `${i.daysSince} d ago`}
                {i.due && <span className="muted"> · due</span>}
              </td>
              <td>{i.latest ? <StatusBadge status={i.status} /> : '—'}</td>
              <td>{i.reasons.map((r) => <div key={r.text}>{r.text}</div>)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
