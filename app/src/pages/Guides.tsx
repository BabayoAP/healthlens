import { environmentById } from '../lib/environment';
import { formatValue } from '../lib/indicators';
import { GUIDES } from '../lib/guides';
import { evaluateAstronaut, worst } from '../lib/status';
import { useData } from '../lib/store';
import type { Status } from '../lib/types';
import { StatusBadge } from '../components/StatusBadge';

/** One card per measurement: how to take it, why it matters in space, what to do if it looks wrong. */
export function Guides({ astronautId }: { astronautId: string }) {
  const data = useData();
  const env = environmentById[data.environment];
  const ev = evaluateAstronaut(astronautId, data.readings, data.skinScans, data.now);

  return (
    <section>
      <h2>Measurement guides</h2>
      <p className="muted">How to take each measurement, why it matters in space, and what to do if it looks wrong. Set for: {env.label}.</p>

      {GUIDES.map((g) => {
        const mine = ev.indicators.filter((i) => g.indicators.includes(i.def.id) && i.latest);
        const skinReasons = g.id === 'skin' ? ev.reasons.filter((r) => r.kind === 'skin') : [];
        const status = [...mine.map((i) => i.status), ...skinReasons.map((r) => r.status)]
          .reduce<Status | undefined>((s, x) => (s ? worst(s, x) : x), undefined);
        return (
          // Guides for anything currently flagged start open
          <details className="panel guide" key={g.id} open={status !== undefined && status !== 'ok'}>
            <summary>
              <span className="guide-title">{g.title}</span>
              <span className="hazard">{g.hazard}</span>
              {status && <StatusBadge status={status} />}
            </summary>

            <h4>How to measure</h4>
            <ol>{g.how(env).map((s) => <li key={s}>{s}</li>)}</ol>

            <h4>Why it matters in space</h4>
            <p>{g.why}</p>

            <h4>What is normal</h4>
            <p>{g.normal}</p>
            {mine.map((i) => (
              <p className="muted" key={i.def.id}>
                Your latest {i.def.label.toLowerCase()}: {formatValue(i.def, i.latest!.value)}
                {i.baseline !== undefined && <> · your baseline: {formatValue(i.def, i.baseline)}</>}
              </p>
            ))}

            <h4>If it looks wrong</h4>
            <ol>{g.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol>

            <h4>When to get help</h4>
            <p>{g.escalate}</p>
          </details>
        );
      })}
      <p className="muted">Reference information for this demo, not medical advice. Follow your mission's medical procedures.</p>
    </section>
  );
}
