import { useState } from 'react';
import { SYSTEM_INFO } from '../lib/bodyRegions';
import { evaluateAstronaut } from '../lib/status';
import { useData } from '../lib/store';
import { IndicatorList } from '../components/IndicatorList';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'flagged', label: 'Needs attention' },
  { id: 'due', label: 'Due now' },
] as const;

/** Every indicator from the registry, grouped by body system. Open a row for its trend and guidance. */
export function Vitals({ astronautId }: { astronautId: string }) {
  const data = useData();
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now, data.symptomLogs);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const count = {
    all: ev.indicators.length,
    flagged: ev.indicators.filter((i) => i.latest && i.status !== 'ok').length,
    due: ev.indicators.filter((i) => i.due).length,
  };
  const shown = ev.indicators.filter((i) => (filter === 'flagged' ? i.latest && i.status !== 'ok' : filter === 'due' ? i.due : true));
  const systems = [...new Set(shown.map((i) => i.def.system))];

  return (
    <section>
      <h2>Indicators</h2>
      <div className="row" role="group" aria-label="Filter indicators">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`chip${filter === f.id ? ' on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} {count[f.id]}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="muted">Nothing here right now.</p>}
      {systems.map((sys) => (
        <div key={sys}>
          <h3 className="ind-group">{SYSTEM_INFO[sys]?.title ?? sys}</h3>
          <IndicatorList astronautId={astronautId} indicators={shown.filter((i) => i.def.system === sys)} />
        </div>
      ))}
    </section>
  );
}
