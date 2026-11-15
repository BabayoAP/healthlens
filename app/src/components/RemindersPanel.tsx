import { crew } from '../lib/mockData';
import { buildReminders, dueText, needsDoing } from '../lib/reminders';
import { evaluateAstronaut } from '../lib/status';
import { useData } from '../lib/store';

/** Crew-wide list of checks that are due or overdue (PRD §5.11). Each item opens the screen where it is done. */
export function RemindersPanel({ onOpen }: { onOpen: (astronautId: string, tab: 'check-in' | 'skin') => void }) {
  const data = useData();
  const rows = crew
    .map((a) => ({
      a,
      todo: buildReminders(a.id, evaluateAstronaut(a.id, data.readings, data.skinScans, data.now), data.skinScans, data.now).filter(needsDoing),
    }))
    .filter((r) => r.todo.length > 0);
  const total = rows.reduce((n, r) => n + r.todo.length, 0);

  return (
    <div className="panel reminders">
      <div className="panel-head">
        <h3>Checks due</h3>
        <span className="muted">{total === 0 ? 'All done' : `${total} to do`}</span>
      </div>
      {total === 0 ? (
        <p className="muted">Every crew member is up to date with their checks.</p>
      ) : (
        <ul className="plain">
          {rows.map(({ a, todo }) => (
            <li key={a.id} className="reminder-row">
              <strong>{a.name}</strong>
              <span className="row">
                {todo.map((r) => (
                  <button type="button" key={r.id} className={`reminder reminder-${r.state}`} onClick={() => onOpen(a.id, r.tab)}>
                    {r.label} <span className="reminder-when">{dueText(r)}</span>
                  </button>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
