import { describe, expect, it } from 'vitest';
import { matchToPrevious, riskOf, toLesion } from './analysis';
import type { Lesion } from './types';

const spot = (over: Partial<Parameters<typeof riskOf>[0]> = {}) => ({
  x: 0.5, y: 0.5, diameterMm: 3, color: 'brown',
  asymmetry: false, irregularBorder: false, multipleColors: false, ulceratedOrBleeding: false, notes: [],
  ...over,
});

const prev = (over: Partial<Lesion> = {}): Lesion => ({
  id: 'old', x: 0.5, y: 0.5, diameterMm: 4, color: 'brown', notes: [], risk: 'ok', change: 'new', ...over,
});

describe('riskOf', () => {
  it('large measured spot is Act', () => {
    expect(riskOf(spot({ diameterMm: 8 }), true)).toBe('act');
  });
  it('large estimated spot is only Watch', () => {
    expect(riskOf(spot({ diameterMm: 8 }), false)).toBe('watch');
  });
  it('two of A/B/C is Act even with an estimated size', () => {
    expect(riskOf(spot({ asymmetry: true, irregularBorder: true }), false)).toBe('act');
  });
  it('small plain spot is OK', () => {
    expect(riskOf(spot(), false)).toBe('ok');
  });
});

describe('matchToPrevious growth', () => {
  it('counts growth between measured sizes', () => {
    const [l] = matchToPrevious([toLesion(spot({ diameterMm: 6 }), true)], [prev()]);
    expect(l.change).toBe('changed');
    expect(l.id).toBe('old');
  });
  it('does not count growth when the new size is estimated', () => {
    const [l] = matchToPrevious([toLesion(spot({ diameterMm: 12 }), false)], [prev({ diameterMm: 6.5 })]);
    expect(l.change).toBe('stable');
    expect(l.notes).toContain('E: size not comparable (no size reference)');
  });
  it('does not count growth when the old size was estimated', () => {
    const [l] = matchToPrevious([toLesion(spot({ diameterMm: 6 }), true)], [prev({ sizeMeasured: false })]);
    expect(l.change).toBe('stable');
  });
});
