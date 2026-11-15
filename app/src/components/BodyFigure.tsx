import type { KeyboardEvent } from 'react';
import { SYSTEM_INFO, type FigureRegionId } from '../lib/bodyRegions';
import { regionFinding, type RegionView } from '../lib/bodyView';
import type { Status } from '../lib/types';

/** Figure shapes, drawn facing the viewer: the person's left side is on the viewer's right. */
const SHAPES: Record<FigureRegionId, { d: string; labelAt: [number, number] }> = {
  head: { d: 'M100 8c13 0 22 10.5 22 25c0 10-4.5 18-11 22.5V68H89V55.5C82.5 51 78 43 78 33c0-14.5 9-25 22-25Z', labelAt: [100, 34] },
  chest: { d: 'M70 74h60c12 0 20 8 21 19l1 59H48l1-59c1-11 9-19 21-19Z', labelAt: [100, 115] },
  abdomen: { d: 'M51 156h98l1 44c0 10-2 19-5 26H55c-3-7-5-16-5-26Z', labelAt: [100, 192] },
  'right-arm': { d: 'M38 80c5 0 8 4 8 10l-2 72l-4 62c-.5 6-3.5 10-8 10s-7.5-4-7.5-10l1-62l3-72c.4-6 4.5-10 9.5-10Z', labelAt: [35, 165] },
  'left-arm': { d: 'M162 80c-5 0-8 4-8 10l2 72l4 62c.5 6 3.5 10 8 10s7.5-4 7.5-10l-1-62l-3-72c-.4-6-4.5-10-9.5-10Z', labelAt: [165, 165] },
  'right-leg': { d: 'M56 230h40l-3 84l-4 68c-.4 7-5 11-11 11s-10.6-4-11-11l-4-68l-7-84Z', labelAt: [77, 300] },
  'left-leg': { d: 'M144 230h-40l3 84l4 68c.4 7 5 11 11 11s10.6-4 11-11l4-68l7-84Z', labelAt: [123, 300] },
};

const STATUS_WORD: Record<Status, string> = { ok: 'OK', watch: 'Watch', act: 'Act' };
const MARK: Record<Status, string> = { ok: '✓', watch: '!', act: '!!' };

interface Props {
  views: RegionView[];
  selectedId?: FigureRegionId;
  onPick: (id: FigureRegionId) => void;
  /** Label flagged parts beside the figure with a leader line (dashboard) */
  callouts?: boolean;
}

/** Clickable body figure, colored by status. Status is never shown by color alone: flagged parts also carry a mark. */
export function BodyFigure({ views, selectedId, onPick, callouts = false }: Props) {
  const onKey = (id: FigureRegionId) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(id); }
  };
  const flagged = callouts ? views.filter((v) => v.status && v.status !== 'ok') : [];
  // Callouts sit on the side of the figure their body part is on, stacked so they never overlap
  const sides = { left: [] as RegionView[], right: [] as RegionView[] };
  for (const v of flagged) (SHAPES[v.region.id].labelAt[0] < 100 ? sides.left : sides.right).push(v);
  const rowY = (v: RegionView, list: RegionView[]) => {
    const ideal = SHAPES[v.region.id].labelAt[1];
    const i = list.indexOf(v);
    return Math.max(ideal, 40 + i * 70);
  };

  const viewBox = callouts ? '-150 0 500 410' : '0 0 200 410';

  return (
    <svg viewBox={viewBox} className={`figure${callouts ? ' figure-callouts' : ''}`} role="group" aria-label="Body figure, facing you">
      {views.map(({ region, status }) => {
        const [lx, ly] = SHAPES[region.id].labelAt;
        return (
          <g
            key={region.id} role="button" tabIndex={0}
            aria-label={`${region.label}: ${SYSTEM_INFO[region.system]!.title}. ${status ? STATUS_WORD[status] : 'No data yet'}`}
            aria-pressed={selectedId === region.id}
            className={`region region-${status ?? 'none'}${selectedId === region.id ? ' region-selected' : ''}`}
            onClick={() => onPick(region.id)} onKeyDown={onKey(region.id)}
          >
            <path d={SHAPES[region.id].d} />
            {status && status !== 'ok' && <text x={lx} y={ly} textAnchor="middle" dy="0.35em">{MARK[status]}</text>}
          </g>
        );
      })}

      {(['left', 'right'] as const).flatMap((side) => sides[side].map((v) => {
        const [ax, ay] = SHAPES[v.region.id].labelAt;
        const y = rowY(v, sides[side]);
        const edge = side === 'left' ? -10 : 210;
        const textX = side === 'left' ? -14 : 214;
        const anchor = side === 'left' ? 'end' : 'start';
        return (
          <g key={v.region.id} className={`callout callout-${v.status}`} aria-hidden="true" onClick={() => onPick(v.region.id)}>
            <polyline points={`${ax},${ay} ${side === 'left' ? 4 : 196},${y} ${edge},${y}`} />
            <circle cx={ax} cy={ay} r={4} />
            <text x={textX} y={y - 4} textAnchor={anchor} className="callout-title">{v.region.label}</text>
            <text x={textX} y={y + 13} textAnchor={anchor} className="callout-text">{regionFinding(v)}</text>
          </g>
        );
      }))}
    </svg>
  );
}
