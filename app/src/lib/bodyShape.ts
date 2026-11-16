import type { FigureRegionId } from './bodyRegions';

/**
 * One mannequin shape for both body figures. The 3D view builds smooth surfaces from it,
 * the 2D view draws its front outline, so both always have the same silhouette.
 *
 * Units are meters, y up, feet at 0. +x is the person's left (the viewer's right when facing them),
 * +z is the front. Left-side parts are written once and mirrored for the right.
 */
export type V3 = [number, number, number];

/** Cross-section stacked along y (torso, head): half width, front and back depth, chest bulge. */
export interface Ring { y: number; w: number; df: number; db: number; pec?: number }
/** Cross-section along a limb: center, half width to the side, half depth the other way. */
export interface Station { c: V3; w: number; d: number }

export type Part =
  | { kind: 'stack'; rings: Ring[] }
  | { kind: 'tube'; stations: Station[]; hull2d?: boolean }
  | { kind: 'ellipsoid'; c: V3; r: V3; no2d?: boolean };

const TORSO: Ring[] = [
  { y: 0.8, w: 0.06, df: 0.05, db: 0.06 },
  { y: 0.84, w: 0.135, df: 0.085, db: 0.1 },
  { y: 0.9, w: 0.168, df: 0.095, db: 0.115 },
  { y: 0.96, w: 0.165, df: 0.095, db: 0.11 },
  { y: 1.02, w: 0.148, df: 0.09, db: 0.095 },
  { y: 1.08, w: 0.137, df: 0.09, db: 0.09 },
  { y: 1.1, w: 0.138, df: 0.092, db: 0.09 }, // abdomen / chest split
  { y: 1.16, w: 0.148, df: 0.1, db: 0.092 },
  { y: 1.22, w: 0.158, df: 0.104, db: 0.095, pec: 0.012 },
  { y: 1.28, w: 0.166, df: 0.106, db: 0.1, pec: 0.022 },
  { y: 1.34, w: 0.174, df: 0.1, db: 0.1, pec: 0.016 },
  { y: 1.4, w: 0.19, df: 0.085, db: 0.09 },
  { y: 1.44, w: 0.178, df: 0.07, db: 0.075 },
  { y: 1.47, w: 0.13, df: 0.055, db: 0.06 },
  { y: 1.495, w: 0.075, df: 0.05, db: 0.055 },
  { y: 1.505, w: 0.062, df: 0.048, db: 0.05 },
];
const SPLIT = 1.1;

const HEAD: Ring[] = [
  { y: 1.48, w: 0.062, df: 0.055, db: 0.055 },
  { y: 1.55, w: 0.058, df: 0.055, db: 0.052 },
  { y: 1.585, w: 0.06, df: 0.064, db: 0.054 },
  { y: 1.605, w: 0.064, df: 0.087, db: 0.064 },
  { y: 1.64, w: 0.075, df: 0.096, db: 0.078 },
  { y: 1.68, w: 0.083, df: 0.1, db: 0.09 },
  { y: 1.72, w: 0.085, df: 0.098, db: 0.096 },
  { y: 1.76, w: 0.081, df: 0.09, db: 0.094 },
  { y: 1.795, w: 0.066, df: 0.072, db: 0.078 },
  { y: 1.82, w: 0.038, df: 0.042, db: 0.046 },
  { y: 1.832, w: 0.004, df: 0.004, db: 0.004 },
];

const s = (x: number, y: number, z: number, w: number, d: number): Station => ({ c: [x, y, z], w, d });

const ARM: Station[] = [
  // Starts under the shoulder line so the deltoid caps the shoulder instead of poking above it
  s(0.19, 1.43, 0, 0.03, 0.03), s(0.21, 1.4, 0, 0.05, 0.05), s(0.222, 1.37, 0, 0.055, 0.053),
  s(0.228, 1.32, 0, 0.049, 0.048), s(0.232, 1.27, 0, 0.044, 0.047), s(0.238, 1.19, 0, 0.04, 0.042),
  s(0.242, 1.12, 0, 0.035, 0.037), s(0.246, 1.06, 0.005, 0.039, 0.038), s(0.251, 0.97, 0.012, 0.033, 0.03),
  s(0.256, 0.89, 0.018, 0.024, 0.02), s(0.257, 0.875, 0.019, 0.022, 0.02),
];
// Palm faces the thigh, so the hand is thin to the side and wide front to back
const HAND: Station[] = [
  s(0.257, 0.89, 0.02, 0.018, 0.024), s(0.259, 0.85, 0.022, 0.022, 0.042), s(0.261, 0.8, 0.022, 0.021, 0.044),
  s(0.262, 0.76, 0.02, 0.017, 0.038), s(0.262, 0.725, 0.018, 0.013, 0.03), s(0.262, 0.708, 0.017, 0.004, 0.012),
];
const THUMB: Station[] = [s(0.25, 0.865, 0.04, 0.012, 0.012), s(0.246, 0.83, 0.055, 0.011, 0.01), s(0.244, 0.805, 0.06, 0.004, 0.004)];
const LEG: Station[] = [
  // Starts inside the pelvis, so the hips belong to the abdomen and the legs begin at the hip crease
  s(0.08, 0.93, 0, 0.07, 0.08), s(0.09, 0.85, 0, 0.088, 0.093), s(0.097, 0.76, 0.005, 0.078, 0.082),
  s(0.103, 0.62, 0.008, 0.062, 0.066), s(0.107, 0.53, 0.012, 0.05, 0.056), s(0.109, 0.49, 0.015, 0.047, 0.053),
  s(0.111, 0.44, 0.008, 0.046, 0.05), s(0.113, 0.37, -0.005, 0.051, 0.057), s(0.115, 0.27, -0.004, 0.042, 0.046),
  s(0.117, 0.16, -0.002, 0.032, 0.034), s(0.119, 0.09, 0, 0.027, 0.029), s(0.12, 0.05, 0, 0.03, 0.033), s(0.12, 0.03, 0, 0.028, 0.03),
];
// Runs heel to toe, so `d` here is the foot's half height
const FOOT: Station[] = [
  s(0.12, 0.05, -0.06, 0.028, 0.028), s(0.12, 0.05, -0.045, 0.034, 0.04), s(0.122, 0.05, 0, 0.037, 0.045),
  s(0.126, 0.035, 0.07, 0.044, 0.032), s(0.128, 0.025, 0.12, 0.045, 0.022), s(0.13, 0.02, 0.16, 0.04, 0.016),
  s(0.13, 0.02, 0.18, 0.02, 0.01),
];

const flip = (st: Station[]): Station[] => st.map((x) => ({ ...x, c: [-x.c[0], x.c[1], x.c[2]] }));
const ear = (side: 1 | -1): Part => ({ kind: 'ellipsoid', c: [side * 0.079, 1.69, -0.005], r: [0.012, 0.03, 0.018] });
const arm = (st: (x: Station[]) => Station[]): Part[] => [
  { kind: 'tube', stations: st(ARM) }, { kind: 'tube', stations: st(HAND) }, { kind: 'tube', stations: st(THUMB) },
];
const leg = (st: (x: Station[]) => Station[]): Part[] => [{ kind: 'tube', stations: st(LEG) }, { kind: 'tube', stations: st(FOOT), hull2d: true }];
const same = (x: Station[]) => x;

export const BODY: Record<FigureRegionId, Part[]> = {
  head: [{ kind: 'stack', rings: HEAD }, { kind: 'ellipsoid', c: [0, 1.685, 0.098], r: [0.011, 0.022, 0.016], no2d: true }, ear(1), ear(-1)],
  chest: [{ kind: 'stack', rings: TORSO.filter((r) => r.y >= SPLIT) }],
  abdomen: [{ kind: 'stack', rings: TORSO.filter((r) => r.y <= SPLIT) }],
  'left-arm': arm(same),
  'right-arm': arm(flip),
  'left-leg': leg(same),
  'right-leg': leg(flip),
};

/** Draw order for the 2D figure: limbs first so the torso's edge sits over the shoulder and hip joins. */
export const DRAW_ORDER: FigureRegionId[] = ['left-leg', 'right-leg', 'left-arm', 'right-arm', 'abdomen', 'chest', 'head'];

/** Catmull-Rom through numeric records: k points per interval, so outlines and surfaces come out smooth. */
export function densify<T>(pts: T[], get: (p: T) => number[], make: (v: number[]) => T, k = 4): T[] {
  if (pts.length < 3) return pts;
  const v = pts.map(get);
  const out: T[] = [];
  for (let i = 0; i < v.length - 1; i++) {
    const p0 = v[Math.max(0, i - 1)], p1 = v[i], p2 = v[i + 1], p3 = v[Math.min(v.length - 1, i + 2)];
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push(make(p1.map((_, n) => 0.5 * (2 * p1[n] + (-p0[n] + p2[n]) * t + (2 * p0[n] - 5 * p1[n] + 4 * p2[n] - p3[n]) * t2 + (-p0[n] + 3 * p1[n] - 3 * p2[n] + p3[n]) * t3))));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export const smoothRings = (r: Ring[], k = 4) =>
  densify(r, (x) => [x.y, x.w, x.df, x.db, x.pec ?? 0], ([y, w, df, db, pec]) => ({ y, w, df, db, pec }), k);
export const smoothStations = (st: Station[]) =>
  densify(st, (x) => [...x.c, x.w, x.d], ([a, b, c, w, d]): Station => ({ c: [a, b, c], w, d }));

/** Sculpted front of the torso: chest muscles, the centre line and the abdominal muscles (meters of bulge). */
export function relief(x: number, y: number, pec: number): number {
  const ax = Math.abs(x);
  let z = pec * Math.exp(-(((ax - 0.075) / 0.045) ** 2));
  if (y > 0.97 && y < 1.37) z -= 0.003 * Math.exp(-((x / 0.012) ** 2));
  for (const yk of [1.0, 1.06, 1.12, 1.18]) z += 0.005 * Math.exp(-(((ax - 0.033) / 0.02) ** 2) - ((y - yk) / 0.022) ** 2);
  return z;
}

// ---------- 2D front outline ----------

/** Meters to the 2D figure's viewBox (0 0 200 410). */
const S = 220;
const X = (x: number) => 100 + x * S;
const Y = (y: number) => (1.85 - y) * S;
/**
 * Closed SVG subpath. Every subpath is wound the same way, so where a region's pieces overlap
 * (leg and foot, arm and hand) the fill adds up instead of cancelling into a hole.
 */
const path = (pts: [number, number][]) => {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  const ordered = area < 0 ? [...pts].reverse() : pts;
  return `M${ordered.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('L')}Z`;
};

/** Convex hull (monotone chain), for parts seen end-on from the front like the feet. */
function hull(pts: [number, number][]): [number, number][] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: [number, number][]) => {
    const h: [number, number][] = [];
    for (const q of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    return h.slice(0, -1);
  };
  return [...half(p), ...half([...p].reverse())];
}

function outline(part: Part): string | undefined {
  if (part.kind === 'ellipsoid') {
    if (part.no2d) return undefined;
    return path(Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return [part.c[0] + Math.cos(a) * part.r[0], part.c[1] + Math.sin(a) * part.r[1]];
    }));
  }
  if (part.kind === 'stack') {
    const r = smoothRings(part.rings);
    return path([...r.map((x): [number, number] => [x.w, x.y]), ...[...r].reverse().map((x): [number, number] => [-x.w, x.y])]);
  }
  const st = smoothStations(part.stations);
  if (part.hull2d) {
    // Seen end-on: each cross-section is an ellipse in the picture plane
    return path(hull(st.flatMap((x) => Array.from({ length: 12 }, (_, i): [number, number] => {
      const a = (i / 12) * Math.PI * 2;
      return [x.c[0] + Math.cos(a) * x.w, x.c[1] + Math.sin(a) * x.d];
    }))));
  }
  // Offset the centerline sideways by the half width, in the picture plane
  const side = (sign: 1 | -1) => st.map((x, i): [number, number] => {
    const a = st[Math.max(0, i - 1)].c, b = st[Math.min(st.length - 1, i + 1)].c;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [x.c[0] + sign * ((a[1] - b[1]) / len) * x.w, x.c[1] + sign * ((b[0] - a[0]) / len) * x.w];
  });
  return path([...side(1), ...side(-1).reverse()]);
}

/** SVG path data (viewBox 0 0 200 410) for one region's front outline. */
export function regionPath(id: FigureRegionId): string {
  return BODY[id].map(outline).filter(Boolean).join('');
}

/** Where a region's status mark and callout line attach, in viewBox units. */
export const LABEL_AT: Record<FigureRegionId, [number, number]> = {
  head: [X(0), Y(1.7)], chest: [X(0), Y(1.28)], abdomen: [X(0), Y(0.98)],
  'left-arm': [X(0.244), Y(1.1)], 'right-arm': [X(-0.244), Y(1.1)],
  'left-leg': [X(0.105), Y(0.5)], 'right-leg': [X(-0.105), Y(0.5)],
};
