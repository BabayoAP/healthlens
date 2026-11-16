import { describe, expect, it } from 'vitest';
import { regionAt } from './anatomy';

describe('3D anatomy regions', () => {
  it('splits the body into the body-map parts', () => {
    expect(regionAt(0, 1.6)).toBe('head');
    expect(regionAt(0.03, 1.33)).toBe('chest'); // the heart sits left of center
    expect(regionAt(-0.06, 1.12)).toBe('abdomen'); // the liver
    expect(regionAt(0.08, 0.4)).toBe('left-leg');
    expect(regionAt(-0.08, 0.4)).toBe('right-leg');
  });

  it('puts hands and shoulders on the arms, and +x is the person’s left', () => {
    expect(regionAt(0.28, 0.75)).toBe('left-arm');
    expect(regionAt(-0.28, 0.75)).toBe('right-arm');
    expect(regionAt(0.17, 1.4)).toBe('left-arm');
    expect(regionAt(0.15, 1.0)).toBe('abdomen'); // hip, not hand
  });

  it('follows the female body: arms angled out, wider hips, shorter', () => {
    expect(regionAt(0.38, 0.75, 'female')).toBe('left-arm'); // hand, far out
    expect(regionAt(0.2, 0.8, 'female')).toBe('abdomen'); // hip
    expect(regionAt(-0.2, 1.05, 'female')).toBe('right-arm');
    expect(regionAt(0, 1.5, 'female')).toBe('head');
    expect(regionAt(0.1, 0.5, 'female')).toBe('left-leg');
  });
});
