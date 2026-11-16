import type { CheckTab } from '../lib/guides';
import { cadenceText, checkHistory, dueText, needsDoing, type Reminder } from '../lib/reminders';
import { useData } from '../lib/store';

const DAY = 86_400_000;
const PAST_WEEKS = 6;
const FUTURE_WEEKS = 2;
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * One small calendar heatmap per check (styled after Bklit UI's contribution heatmap):
 * filled dots are days it was done, the boxed day is when it is next due (red once it is late).
 * Columns are weeks, Monday on top.
 */
export function CheckSchedule({ astronautId, reminders, onDo }: { astronautId: string; reminders: Reminder[]; onDo: (tab: CheckTab) => void }) {
  const data = useData();
  const todayRow = (new Date(data.now).getDay() + 6) % 7; // Monday = 0
  const cols = PAST_WEEKS + 1 + FUTURE_WEEKS;
  const label = (off: number) => new Date(data.now + off * DAY).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <div className="sched-grid">
        {reminders.map((r) => {
          const done = checkHistory(r.id, astronautId, data.readings, data.skinScans, data.now);
          const due = r.daysSince === undefined ? 0 : r.dueInDays;
          const late = needsDoing(r);
          return (
            <article className={`sched panel${late ? ' sched-late' : ''}`} key={r.id}>
              <div className="sched-head">
                <strong>{r.label}</strong>
                <span className={`sched-when${r.state === 'overdue' ? ' sched-overdue' : ''}`}>{cadenceText(r.cadenceDays)} · {dueText(r)}</span>
              </div>
              <div className="sched-cal" role="img" aria-label={`${r.label}: done on ${done.size} days in the last ${PAST_WEEKS} weeks, ${dueText(r)}`}>
                <div className="sched-days" aria-hidden="true">{WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}</div>
                <div className="sched-weeks" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden="true">
                  {Array.from({ length: cols * 7 }, (_, n) => {
                    const c = Math.floor(n / 7), row = n % 7;
                    const off = (c - PAST_WEEKS) * 7 + row - todayRow;
                    const count = done.get(off) ?? 0;
                    const cls = [
                      'cell',
                      off > 0 ? 'cell-future' : count >= 2 ? 'cell-on2' : count === 1 ? 'cell-on1' : '',
                      off === 0 ? 'cell-today' : '',
                      off === due ? (late ? 'cell-due cell-due-late' : 'cell-due') : '',
                      late && off > due && off <= 0 ? 'cell-missed' : '',
                    ].filter(Boolean).join(' ');
                    const tip = `${label(off)}${count ? ` · done${count > 1 ? ` ${count}×` : ''}` : ''}${off === due ? ' · due' : ''}`;
                    return <span key={n} className={cls} title={tip} />;
                  })}
                </div>
              </div>
              {late && <button type="button" className="ghost sched-do" onClick={() => onDo(r.tab)}>Do it now</button>}
            </article>
          );
        })}
      </div>
      <p className="sched-legend" aria-hidden="true">
        <span className="cell" /> not done <span className="cell cell-on1" /> done <span className="cell cell-due" /> next due <span className="cell cell-due cell-due-late" /> late
      </p>
    </>
  );
}
