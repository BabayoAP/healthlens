import { describe, expect, it } from 'vitest';
import { buildBodyMesh, REGION_ORDER, surfaceNets, type Mesh } from './bodyMesh';

/** Signed volume of a closed mesh: positive when faces point outward. */
function volume({ positions: p, indices: ix }: Mesh) {
  let v = 0;
  for (let i = 0; i < ix.length; i += 3) {
    const [a, b, c] = [ix[i] * 3, ix[i + 1] * 3, ix[i + 2] * 3];
    v += (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) / 6;
  }
  return v;
}

describe('surface nets', () => {
  it('meshes a sphere outward-facing with about the right volume', () => {
    const m = surfaceNets((x, y, z) => Math.hypot(x, y, z) - 1, [-1.3, -1.3, -1.3], [1.3, 1.3, 1.3], 0.05);
    expect(volume(m) / ((4 / 3) * Math.PI)).toBeGreaterThan(0.95);
    expect(volume(m) / ((4 / 3) * Math.PI)).toBeLessThan(1.05);
  });
});

describe('body mesh', () => {
  it('is one closed, outward-facing surface that covers every region', () => {
    const t = performance.now();
    const m = buildBodyMesh();
    console.log(`body mesh: ${m.positions.length / 3} vertices in ${Math.round(performance.now() - t)} ms`);
    expect(volume(m)).toBeGreaterThan(0.04); // an adult body is roughly 0.06-0.08 m³
    expect(volume(m)).toBeLessThan(0.12);
    const R = REGION_ORDER.length;
    const seen = new Set<number>();
    for (let v = 0; v < m.weights.length / R; v++) {
      let best = 0;
      for (let r = 1; r < R; r++) if (m.weights[v * R + r] > m.weights[v * R + best]) best = r;
      seen.add(best);
    }
    expect(seen.size).toBe(R);
  });
});
