import { guideFor } from '../lib/guides';
import { formatValue } from '../lib/indicators';
import type { IndicatorEval } from '../lib/status';
import { readingsFor, useData } from '../lib/store';
import { referenceLines, watchSize } from '../lib/trends';
import { SourceTag } from './SourceTag';
import { Sparkline } from './Sparkline';
import { TrendChart } from './TrendChart';

const DAY = 86_400_000;

/** Trend of one indicator with the personal baseline and safety limits. */
export function IndicatorTrend({ astronautId, ind, days = 42, height = 130 }: { astronautId: string; ind: IndicatorEval; days?: number; height?: number }) {
  const data = useData();
  const from = data.now - days * DAY;
  return (
    <TrendChart
      label={`${ind.def.label}, last ${days} days`}
      points={readingsFor(data, astronautId, ind.def.id).map((r) => ({ t: Date.parse(r.takenAt), value: r.value, source: r.source })).filter((p) => p.t >= from)}
      format={(v) => formatValue(ind.def, v)} lines={referenceLines(ind.def, ind)}
      from={from} to={data.now} height={height} minSpan={watchSize(ind) * 2.5}
    />
  );
}

const ago = (d?: number) => (d === undefined ? 'never measured' : d === 0 ? 'today' : `${d} d ago`);

/**
 * One row per indicator: status, latest value, change from your baseline and a 2-week sparkline.
 * Flagged rows say why in one line. Open a row for the 6-week trend, why it matters in space, and the guide's next steps.
 */
export function IndicatorList({ astronautId, indicators }: { astronautId: string; indicators: IndicatorEval[] }) {
  const data = useData();
  if (indicators.length === 0) return <p className="muted">No measurements yet.</p>;
  return (
    <ul className="ind-list">
      {indicators.map((i) => {
        const spark = readingsFor(data, astronautId, i.def.id).filter((r) => Date.parse(r.takenAt) >= data.now - 14 * DAY).map((r) => r.value);
        const flagged = i.status !== 'ok' && i.latest;
        const guide = guideFor(i.def.id);
        return (
          <li key={i.def.id}>
            <details className={`ind ind-${i.latest ? i.status : 'none'}`}>
              <summary>
                <span className={`status-dot status-dot-${i.latest ? i.status : 'none'}`} aria-hidden="true" />
                <span className="ind-name">
                  <strong>{i.def.label}</strong>
                  <span className="muted">
                    {i.baseline !== undefined ? `baseline ${formatValue(i.def, i.baseline)} · ` : ''}{ago(i.daysSince)}{i.due ? ' · due' : ''}
                  </span>
                </span>
                <span className="ind-spark"><Sparkline values={spark} width={90} height={28} /></span>
                <span className="ind-value">
                  {i.latest ? <><strong>{formatValue(i.def, i.latest.value)}</strong> <SourceTag source={i.latest.source} device={i.latest.device} /></> : <span className="muted">—</span>}
                  {i.delta !== undefined && i.latest && !/^0(?![.\d])/.test(formatValue(i.def, Math.abs(i.delta))) && (
                    <span className={`ind-delta${flagged ? ` ind-delta-${i.status}` : ''}`}>{i.delta > 0 ? '+' : '−'}{formatValue(i.def, Math.abs(i.delta))}</span>
                  )}
                </span>
                {flagged && <span className="ind-reason">{i.reasons[0]?.text}</span>}
              </summary>
              <div className="ind-more">
                {i.reasons.slice(1).map((r) => <p className={`chart-reason reason-${r.status}`} key={r.text}>{r.text}</p>)}
                {i.latest && <IndicatorTrend astronautId={astronautId} ind={i} />}
                {guide && (
                  <>
                    <details className="fold"><summary>Why it matters in space</summary><p>{guide.why}</p></details>
                    {flagged && <details className="fold"><summary>What to do</summary><ol>{guide.ifAbnormal.map((s) => <li key={s}>{s}</li>)}</ol></details>}
                    <details className="fold"><summary>When to get help</summary><p>{guide.escalate}</p></details>
                  </>
                )}
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
