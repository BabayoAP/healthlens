import { useId, type KeyboardEvent } from 'react';
import { SYSTEM_INFO, type FigureRegionId } from '../lib/bodyRegions';
import { regionFinding, type RegionView } from '../lib/bodyView';
import { DRAW_ORDER, LABEL_AT, regionPath } from '../lib/bodyShape';
import type { Status } from '../lib/types';

/** Front outline of the shared mannequin shape (`lib/bodyShape.ts`), so it matches the 3D figure. */
const SHAPES = Object.fromEntries(
  (Object.keys(LABEL_AT) as FigureRegionId[]).map((id) => [id, { d: regionPath(id), labelAt: LABEL_AT[id] }]),
) as Record<FigureRegionId, { d: string; labelAt: [number, number] }>;

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

  // Only make room for callouts on the sides that have them, so the figure stays as large as possible
  const minX = sides.left.length ? -150 : 0;
  const maxX = sides.right.length ? 350 : 200;
  const viewBox = callouts ? `${minX} 0 ${maxX - minX} 410` : '0 0 200 410';

  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const ordered = [...views].sort((a, b) => DRAW_ORDER.indexOf(a.region.id) - DRAW_ORDER.indexOf(b.region.id));
  const shaded = ordered.filter((v) => (v.status && v.status !== 'ok') || v.region.id === selectedId);

  return (
    <svg viewBox={viewBox} className={`figure${callouts ? ' figure-callouts' : ''}`} role="group" aria-label="Body figure, facing you">
      <defs>
        <clipPath id={`sil-${uid}`}>{ordered.map((v) => <path key={v.region.id} d={SHAPES[v.region.id].d} />)}</clipPath>
        <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      {/* One seamless silhouette: every part stroked thick underneath, then filled on top, so only the outer edge shows */}
      <g className="sil-line" aria-hidden="true">{ordered.map((v) => <path key={v.region.id} d={SHAPES[v.region.id].d} />)}</g>
      <g className="sil-fill" aria-hidden="true">{ordered.map((v) => <path key={v.region.id} d={SHAPES[v.region.id].d} />)}</g>
      {/* Flagged and selected parts are shaded with soft edges, kept inside the silhouette */}
      <g clipPath={`url(#sil-${uid})`} aria-hidden="true">
        <g filter={`url(#soft-${uid})`}>
          {shaded.map((v) => (
            <path key={v.region.id} d={SHAPES[v.region.id].d}
              className={`sil-tint sil-tint-${v.status && v.status !== 'ok' ? v.status : 'none'}${v.region.id === selectedId ? ' sil-tint-selected' : ''}`} />
          ))}
        </g>
      </g>
      {ordered.map(({ region, status }) => {
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
