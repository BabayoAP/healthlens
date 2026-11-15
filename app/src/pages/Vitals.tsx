import { vitals } from '../lib/mockData';
import { vitalsStatus } from '../lib/status';
import { StatusBadge } from '../components/StatusBadge';

export function Vitals({ astronautId }: { astronautId: string }) {
  const rows = vitals
    .filter((r) => r.astronautId === astronautId)
    .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const { status, reasons } = vitalsStatus(rows);

  // TODO: replace table with trend charts + a manual-entry / sensor form.
  return (
    <section>
      <h2>Vitals <StatusBadge status={status} /></h2>
      {reasons.length > 0 && <ul>{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
      <table>
        <thead><tr><th>Date</th><th>HR (bpm)</th><th>BP (mmHg)</th><th>SpO₂</th></tr></thead>
        <tbody>
          {rows.slice().reverse().map((r) => (
            <tr key={r.takenAt}>
              <td>{r.takenAt.slice(0, 10)}</td><td>{r.heartRate}</td>
              <td>{r.systolic}/{r.diastolic}</td><td>{r.spo2}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
