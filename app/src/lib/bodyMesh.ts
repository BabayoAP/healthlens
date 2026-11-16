import { FIGURE_REGIONS, type FigureRegionId } from './bodyRegions';
import { BODY, relief, smoothRings, smoothStations, type Part } from './bodyShape';

/**
 * One seamless mannequin surface for the 3D figure. Every part of `BODY` becomes a signed
 * distance function (negative inside); they are blended with a smooth minimum so joints flow
 * into each other, and the surface is extracted with surface nets. Each vertex also carries a
 * soft weight per body region, so a flagged region can be shaded without a visible edge.
 */

export const REGION_ORDER: FigureRegionId[] = FIGURE_REGIONS.map((r) => r.id);

type Box = [number, number, number, number, number, number];
interface Prim { region: number; box: Box; sd: (x: number, y: number, z: number) => number }

const boxDist = (b: Box, x: number, y: number, z: number) => {
  const dx = Math.max(b[0] - x, 0, x - b[3]), dy = Math.max(b[1] - y, 0, y - b[4]), dz = Math.max(b[2] - z, 0, z - b[5]);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/** Distance along the ray from the centre, for a point with ellipse-normalised radius q and length len. */
const radial = (len: number, q: number, r: number) => (q < 1e-9 ? -r : len * (1 - 1 / q));

function tubePrim(part: Extract<Part, { kind: 'tube' }>, region: number): Prim {
  const st = smoothStations(part.stations);
  const segs = st.slice(0, -1).map((a, i) => {
    const b = st[i + 1];
    const ab = [b.c[0] - a.c[0], b.c[1] - a.c[1], b.c[2] - a.c[2]];
    const L2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1e-9;
    const L = Math.sqrt(L2);
    const T = ab.map((v) => v / L);
    // Same frame as the shape data: side axis carries w, the other is front (limbs) or up (feet)
    const ref = Math.abs(T[2]) > 0.7 ? [0, 1, 0] : [0, 0, 1];
    let B = [T[1] * ref[2] - T[2] * ref[1], T[2] * ref[0] - T[0] * ref[2], T[0] * ref[1] - T[1] * ref[0]];
    const bl = Math.hypot(B[0], B[1], B[2]) || 1;
    B = B.map((v) => v / bl);
    const N = [B[1] * T[2] - B[2] * T[1], B[2] * T[0] - B[0] * T[2], B[0] * T[1] - B[1] * T[0]];
    const r = Math.max(a.w, a.d, b.w, b.d);
    const box: Box = [Math.min(a.c[0], b.c[0]) - r, Math.min(a.c[1], b.c[1]) - r, Math.min(a.c[2], b.c[2]) - r, Math.max(a.c[0], b.c[0]) + r, Math.max(a.c[1], b.c[1]) + r, Math.max(a.c[2], b.c[2]) + r];
    return { a: a.c, ab, L2, T, B, N, a0: a, b0: b, box };
  });
  const box = segs.reduce<Box>((m, s) => [Math.min(m[0], s.box[0]), Math.min(m[1], s.box[1]), Math.min(m[2], s.box[2]), Math.max(m[3], s.box[3]), Math.max(m[4], s.box[4]), Math.max(m[5], s.box[5])], [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]);
  return {
    region, box,
    sd: (x, y, z) => {
      let best = Infinity;
      for (const s of segs) {
        if (boxDist(s.box, x, y, z) > best) continue;
        const px = x - s.a[0], py = y - s.a[1], pz = z - s.a[2];
        const t = Math.max(0, Math.min(1, (px * s.ab[0] + py * s.ab[1] + pz * s.ab[2]) / s.L2));
        const vx = px - s.ab[0] * t, vy = py - s.ab[1] * t, vz = pz - s.ab[2] * t;
        const w = s.a0.w + (s.b0.w - s.a0.w) * t, d = s.a0.d + (s.b0.d - s.a0.d) * t, rt = Math.min(w, d);
        const u = vx * s.B[0] + vy * s.B[1] + vz * s.B[2];
        const v = vx * s.N[0] + vy * s.N[1] + vz * s.N[2];
        const ax = vx * s.T[0] + vy * s.T[1] + vz * s.T[2];
        const q = Math.sqrt((u / w) ** 2 + (v / d) ** 2 + (ax / rt) ** 2);
        const dist = radial(Math.sqrt(vx * vx + vy * vy + vz * vz), q, rt);
        if (dist < best) best = dist;
      }
      return best;
    },
  };
}

function stackPrim(part: Extract<Part, { kind: 'stack' }>, region: number): Prim {
  const rings = smoothRings(part.rings);
  const e = 2.4;
  const wmax = Math.max(...rings.map((r) => r.w)), dmax = Math.max(...rings.map((r) => Math.max(r.df, r.db) + (r.pec ?? 0)));
  const y0 = rings[0].y, y1 = rings[rings.length - 1].y;
  return {
    region,
    box: [-wmax, y0 - 0.06, -dmax, wmax, y1 + 0.06, dmax],
    sd: (x, y, z) => {
      let i = 0;
      while (i < rings.length - 2 && rings[i + 1].y < y) i++;
      const a = rings[i], b = rings[i + 1];
      const t = Math.max(0, Math.min(1, (y - a.y) / (b.y - a.y)));
      const w = a.w + (b.w - a.w) * t, df = a.df + (b.df - a.df) * t, db = a.db + (b.db - a.db) * t, pec = (a.pec ?? 0) + ((b.pec ?? 0) - (a.pec ?? 0)) * t;
      const ay = y < y0 ? y0 - y : y > y1 ? y - y1 : 0;
      const zz = z > 0 ? z - relief(x, y, pec) : z;
      const d = zz > 0 ? df : db;
      const rt = Math.min(w, d);
      const qs = ((Math.abs(x) / w) ** e + (Math.abs(zz) / d) ** e) ** (1 / e);
      const q = Math.sqrt(qs * qs + (ay / rt) ** 2);
      return radial(Math.sqrt(x * x + zz * zz + ay * ay), q, rt);
    },
  };
}

function ellipsoidPrim(part: Extract<Part, { kind: 'ellipsoid' }>, region: number): Prim {
  const [cx, cy, cz] = part.c, [rx, ry, rz] = part.r;
  return {
    region, box: [cx - rx, cy - ry, cz - rz, cx + rx, cy + ry, cz + rz],
    sd: (x, y, z) => {
      const px = x - cx, py = y - cy, pz = z - cz;
      return radial(Math.sqrt(px * px + py * py + pz * pz), Math.sqrt((px / rx) ** 2 + (py / ry) ** 2 + (pz / rz) ** 2), Math.min(rx, ry, rz));
    },
  };
}

const PRIMS: Prim[] = REGION_ORDER.flatMap((id, region) => BODY[id].map((p) =>
  p.kind === 'tube' ? tubePrim(p, region) : p.kind === 'stack' ? stackPrim(p, region) : ellipsoidPrim(p, region)));

const K = 0.014; // blend radius where parts meet
const smin = (a: number, b: number) => {
  const h = Math.max(K - Math.abs(a - b), 0) / K;
  return Math.min(a, b) - h * h * K * 0.25;
};

/** Signed distance to the whole mannequin (meters, negative inside). */
export function bodySdf(x: number, y: number, z: number): number {
  let near = Infinity;
  const bd = PRIMS.map((p) => { const d = boxDist(p.box, x, y, z); if (d < near) near = d; return d; });
  if (near > 0.02) return near;
  let f = Infinity;
  PRIMS.forEach((p, i) => { if (bd[i] < near + 0.05) f = smin(f, p.sd(x, y, z)); });
  return f;
}

export interface Mesh { positions: Float32Array; indices: Uint32Array }

/**
 * Surface nets: one vertex per grid cell the surface passes through (the average of its edge
 * crossings), one quad per grid edge that crosses the surface. Outward-facing, counter-clockwise.
 */
export function surfaceNets(f: (x: number, y: number, z: number) => number, min: [number, number, number], max: [number, number, number], h: number): Mesh {
  const n = [0, 1, 2].map((a) => Math.ceil((max[a] - min[a]) / h) + 1);
  const [nx, ny, nz] = n;
  const val = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) val[i + nx * (j + ny * k)] = f(min[0] + i * h, min[1] + j * h, min[2] + k * h);

  const cx = nx - 1, cy = ny - 1, cz = nz - 1;
  const cell = new Int32Array(cx * cy * cz).fill(-1);
  const pos: number[] = [];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const v = new Float64Array(8);
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let inside = 0;
    for (let c = 0; c < 8; c++) {
      v[c] = val[(i + corner[c][0]) + nx * ((j + corner[c][1]) + ny * (k + corner[c][2]))];
      if (v[c] < 0) inside++;
    }
    if (inside === 0 || inside === 8) continue;
    let sx = 0, sy = 0, sz = 0, m = 0;
    for (const [a, b] of edges) {
      if ((v[a] < 0) === (v[b] < 0)) continue;
      const t = v[a] / (v[a] - v[b]);
      sx += corner[a][0] + t * (corner[b][0] - corner[a][0]);
      sy += corner[a][1] + t * (corner[b][1] - corner[a][1]);
      sz += corner[a][2] + t * (corner[b][2] - corner[a][2]);
      m++;
    }
    cell[i + cx * (j + cy * k)] = pos.length / 3;
    pos.push(min[0] + (i + sx / m) * h, min[1] + (j + sy / m) * h, min[2] + (k + sz / m) * h);
  }

  const idx: number[] = [];
  const cid = (i: number, j: number, k: number) => cell[i + cx * (j + cy * k)];
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const a = val[i + nx * (j + ny * k)];
    // For each axis: the edge to the next grid point, and the four cells around it, in counter-clockwise order about that axis
    const around = [
      [val[i + 1 + nx * (j + ny * k)], [cid(i, j - 1, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i, j - 1, k)]],
      [val[i + nx * (j + 1 + ny * k)], [cid(i - 1, j, k - 1), cid(i - 1, j, k), cid(i, j, k), cid(i, j, k - 1)]],
      [val[i + nx * (j + ny * (k + 1))], [cid(i - 1, j - 1, k), cid(i, j - 1, k), cid(i, j, k), cid(i - 1, j, k)]],
    ] as const;
    for (const [b, q] of around) {
      if ((a < 0) === (b < 0) || q.some((x) => x < 0)) continue;
      const [q0, q1, q2, q3] = a < 0 ? q : [q[3], q[2], q[1], q[0]];
      idx.push(q0, q1, q2, q0, q2, q3);
    }
  }
  return { positions: new Float32Array(pos), indices: new Uint32Array(idx) };
}

export interface BodyMesh extends Mesh {
  /** REGION_ORDER.length weights per vertex, summing to 1 */
  weights: Float32Array;
}

let cached: BodyMesh | undefined;

/** The mannequin mesh, built once per page load (about a second on a laptop). */
export function buildBodyMesh(h = 0.0085): BodyMesh {
  if (cached) return cached;
  const mesh = surfaceNets(bodySdf, [-0.33, -0.015, -0.17], [0.33, 1.86, 0.23], h);
  const p = mesh.positions;
  // Pull each vertex onto the true surface (two Newton steps along the gradient)
  const e = h * 0.3;
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < p.length; i += 3) {
      const x = p[i], y = p[i + 1], z = p[i + 2];
      const d = bodySdf(x, y, z);
      const gx = (bodySdf(x + e, y, z) - bodySdf(x - e, y, z)) / (2 * e);
      const gy = (bodySdf(x, y + e, z) - bodySdf(x, y - e, z)) / (2 * e);
      const gz = (bodySdf(x, y, z + e) - bodySdf(x, y, z - e)) / (2 * e);
      const g2 = gx * gx + gy * gy + gz * gz;
      if (g2 < 1e-6) continue;
      const step = Math.max(-h, Math.min(h, d / g2));
      p[i] -= gx * step; p[i + 1] -= gy * step; p[i + 2] -= gz * step;
    }
  }
  // Soft region weights: nearest region wins, blending over about a centimetre
  const R = REGION_ORDER.length;
  const weights = new Float32Array((p.length / 3) * R);
  const dr = new Float64Array(R);
  for (let vi = 0; vi < p.length / 3; vi++) {
    dr.fill(Infinity);
    const x = p[vi * 3], y = p[vi * 3 + 1], z = p[vi * 3 + 2];
    for (const prim of PRIMS) {
      if (boxDist(prim.box, x, y, z) > 0.03) continue;
      dr[prim.region] = Math.min(dr[prim.region], prim.sd(x, y, z));
    }
    const m = Math.min(...dr);
    let sum = 0;
    for (let r = 0; r < R; r++) { const w = Math.exp(-(dr[r] - m) / 0.008); weights[vi * R + r] = w; sum += w; }
    for (let r = 0; r < R; r++) weights[vi * R + r] /= sum;
  }
  cached = { ...mesh, weights };
  return cached;
}
