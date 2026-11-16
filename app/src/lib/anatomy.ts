import type { FigureRegionId } from './bodyRegions';
import type { BodyType } from './types';

/**
 * Body-map part for a point on a 3D anatomy model (`public/models/body-<type>.glb`).
 * Model frame: meters, y up with the feet at 0, +x is the person's left, +z is the front.
 *
 * The cut-offs were read off each model's skin (`app/scripts/build-body.mjs`):
 * - male (BodyParts3D, 1.72 m): arms hang straight, clear of the torso beyond 18 cm from the center line;
 * - female (HuBMAP / Visible Human Female, 1.66 m): arms angled out about 24°, so the gap between arm
 *   and torso moves outward toward the hands (19 cm at 1.05 m, 30 cm at 0.7 m).
 */
interface Profile {
  chin: number;
  diaphragm: number;
  crotch: number;
  handBottom: number;
  shoulderTop: number;
  deltoidX: number;
  /** Arm / torso boundary: [height, distance from the center line], low to high */
  armX: [number, number][];
}

export const ANATOMY: Record<BodyType, Profile> = {
  male: { chin: 1.46, diaphragm: 1.2, crotch: 0.83, handBottom: 0.6, shoulderTop: 1.36, deltoidX: 0.155, armX: [[0, 0.18], [2, 0.18]] },
  female: {
    chin: 1.42, diaphragm: 1.16, crotch: 0.79, handBottom: 0.55, shoulderTop: 1.3, deltoidX: 0.15,
    armX: [[0.6, 0.33], [0.7, 0.3], [0.85, 0.26], [1.0, 0.185], [1.05, 0.175], [1.1, 0.165], [2, 0.165]],
  },
};

function armXAt(knots: [number, number][], y: number): number {
  if (y <= knots[0][0]) return knots[0][1];
  for (let k = 1; k < knots.length; k++) {
    const [y0, x0] = knots[k - 1], [y1, x1] = knots[k];
    if (y <= y1) return x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
  }
  return knots[knots.length - 1][1];
}

export function regionAt(x: number, y: number, body: BodyType = 'male'): FigureRegionId {
  const a = ANATOMY[body];
  const side = x >= 0 ? 'left' : 'right';
  if (y >= a.chin) return 'head';
  const ax = Math.abs(x);
  if (y > a.handBottom && (ax > armXAt(a.armX, y) || (y > a.shoulderTop && ax > a.deltoidX))) return `${side}-arm`;
  if (y < a.crotch) return `${side}-leg`;
  return y >= a.diaphragm ? 'chest' : 'abdomen';
}
