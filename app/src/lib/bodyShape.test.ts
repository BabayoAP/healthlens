import { describe, expect, it } from 'vitest';
import { FIGURE_REGIONS } from './bodyRegions';
import { regionPath } from './bodyShape';

describe('2D body outline', () => {
  it('draws every region inside the 200 x 410 figure', () => {
    for (const r of FIGURE_REGIONS) {
      const nums = [...regionPath(r.id).matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      expect(nums.length, r.id).toBeGreaterThan(10);
      for (const [x, y] of nums) {
        expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(200);
        expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(410);
      }
    }
  });
  it('left and right are mirror images', () => {
    const xs = (id: 'left-arm' | 'right-arm') => [...regionPath(id).matchAll(/(-?[\d.]+),/g)].map((m) => Number(m[1]));
    expect(Math.max(...xs('left-arm')) - 100).toBeCloseTo(100 - Math.min(...xs('right-arm')), 0);
  });
});
