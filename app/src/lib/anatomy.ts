import type { FigureRegionId } from './bodyRegions';

/**
 * Body-map part for a point on the 3D anatomy model (`public/models/body.glb`).
 * Model frame: meters, y up with the feet at 0, +x is the person's left, +z is the front; height 1.72 m.
 * The cut-offs were read off the BodyParts3D skin: the arms hang clear of the torso beyond 18 cm
 * from the center line between hand and shoulder height; the chin is at about 1.46 m, the
 * diaphragm (chest / abdomen) at about 1.2 m and the crotch at about 0.83 m.
 */
export const ANATOMY = { chin: 1.46, diaphragm: 1.2, crotch: 0.83, armX: 0.18, shoulderTop: 1.36, deltoidX: 0.155, handBottom: 0.6 };

export function regionAt(x: number, y: number): FigureRegionId {
  const a = ANATOMY;
  const side = x >= 0 ? 'left' : 'right';
  if (y >= a.chin) return 'head';
  const ax = Math.abs(x);
  if (y > a.handBottom && (ax > a.armX || (y > a.shoulderTop && ax > a.deltoidX))) return `${side}-arm`;
  if (y < a.crotch) return `${side}-leg`;
  return y >= a.diaphragm ? 'chest' : 'abdomen';
}
