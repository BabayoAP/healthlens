import { FIGURE_REGIONS, type FigureRegion } from './bodyRegions';
import { worst, type AstronautEval, type IndicatorEval, type Reason } from './status';
import type { SkinScan, Status } from './types';

/** What one part of the body figure shows for one astronaut. */
export interface RegionView {
  region: FigureRegion;
  status?: Status;
  indicators: IndicatorEval[];
  /** Symptoms reported for the body systems of this part */
  symptoms: Reason[];
  /** Latest scan of each skin area in this region */
  scans: SkinScan[];
}

/** One view per figure region: its measurements, symptoms and latest skin scans, and the worst status among them. */
export function buildRegionViews(astronautId: string, ev: AstronautEval, skinScans: SkinScan[]): RegionView[] {
  return FIGURE_REGIONS.map((region) => {
    const systems = [region.system, ...(region.also ?? [])];
    const indicators = ev.indicators.filter((i) => systems.includes(i.def.system) && i.latest);
    const symptoms = ev.reasons.filter((r) => r.kind === 'symptom' && r.system !== undefined && systems.includes(r.system));
    const scans = region.skin.flatMap((area) => {
      const all = skinScans.filter((s) => s.astronautId === astronautId && s.region === area);
      return all.length ? [all.reduce((a, b) => (a.takenAt > b.takenAt ? a : b))] : [];
    });
    const statuses = [...indicators.map((i) => i.status), ...symptoms.map((r) => r.status), ...scans.flatMap((s) => s.lesions.map((l) => l.risk))];
    const hasAny = indicators.length > 0 || scans.length > 0 || symptoms.length > 0;
    return { region, indicators, symptoms, scans, status: hasAny ? statuses.reduce<Status>((a, b) => worst(a, b), 'ok') : undefined };
  });
}

/** Short reason a region is flagged, for callouts: skin findings first, then the first flagged measurement or symptom. */
export function regionFinding(v: RegionView): string | undefined {
  const spot = v.scans.flatMap((s) => s.lesions).find((l) => l.risk !== 'ok');
  if (spot) return `${spot.change === 'new' ? 'New' : spot.change === 'changed' ? 'Changed' : 'Flagged'} skin spot, ${spot.diameterMm} mm`;
  const ind = v.indicators.find((i) => i.status !== 'ok');
  if (ind) return ind.def.label;
  return v.symptoms[0]?.text;
}
