import { describe, expect, it } from 'vitest';
import { monotonePath } from './trends';

describe('monotonePath', () => {
  it('never bends past the data (no overshoot on a step)', () => {
    const d = monotonePath([[0, 10], [10, 10], [20, 50], [30, 50]]);
    const ys = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((x) => Number(x[2]));
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...ys)).toBeLessThanOrEqual(50);
  });
  it('handles 0 and 1 points', () => {
    expect(monotonePath([])).toBe('');
    expect(monotonePath([[1, 2]])).toBe('M1.0,2.0');
  });
});
