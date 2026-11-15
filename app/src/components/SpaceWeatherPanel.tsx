import { environmentById } from '../lib/environment';
import { SOURCES } from '../lib/sources';
import { SW_LABEL, assessSpaceWeather, useSpaceWeather } from '../lib/spaceWeather';
import { useData } from '../lib/store';
import { StatusBadge } from './StatusBadge';

const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Radiation watch for the crew, driven by NASA's DONKI space-weather notifications. */
export function SpaceWeatherPanel({ onOpenStormGuide }: { onOpenStormGuide: () => void }) {
  const { environment, now } = useData();
  const weather = useSpaceWeather();
  const a = assessSpaceWeather(weather.events, now, environment);
  const env = environmentById[environment];

  const events = weather.events.filter((e) => e.type !== 'Report');
  const counts = new Map<string, number>();
  for (const e of events) counts.set(SW_LABEL[e.type], (counts.get(SW_LABEL[e.type]) ?? 0) + 1);

  return (
    <div className="panel space-weather">
      <div className="panel-head">
        <h3>Radiation watch: space weather</h3>
        <StatusBadge status={a.status} />
      </div>
      <p><strong>{a.headline}.</strong> {a.detail}</p>
      {a.status !== 'ok' && (
        <p>
          <button type="button" className={a.status === 'act' ? 'emergency-btn' : 'ghost'} onClick={onOpenStormGuide}>
            Open the radiation storm guide
          </button>
        </p>
      )}
      <p className="muted">If a storm hits here ({env.label}): {env.shelter}</p>

      <details className="sw-details">
      <summary>Last 30 days, reported by NASA</summary>
      {events.length === 0 ? <p className="muted">No notifications in this period.</p> : (
        <>
          <p className="muted">{[...counts.entries()].map(([label, n]) => `${n} × ${label.toLowerCase()}`).join(' · ')}</p>
          <ul className="plain sw-list">
            {events.slice(0, 4).map((e) => (
              <li key={e.id}>
                <strong>{when(e.issued)} · {SW_LABEL[e.type]}.</strong> {e.summary}{' '}
                <a href={e.url} target="_blank" rel="noreferrer">NASA notice</a>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="muted">
        Source: <a href={SOURCES.donki.url} target="_blank" rel="noreferrer">NASA CCMC DONKI</a>.{' '}
        {weather.origin === 'live'
          ? `Live data, fetched ${new Date(weather.fetchedAt).toLocaleString()}.`
          : `No connection to NASA right now: showing the copy saved on ${when(new Date(weather.fetchedAt).toISOString())}.`}{' '}
        DONKI is NASA research information that watches conditions near Earth; a crew farther out would also rely on its own dosimeters.
      </p>
      </details>
    </div>
  );
}
