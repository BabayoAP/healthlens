import type { BodyRegion, Lesion, SkinScan } from './types';

/**
 * Analyze a skin photo and return detected lesions, compared against the
 * previous scan of the same region.
 *
 * MOCK for now: returns fake lesions so the UI can be built.
 * TODO: replace with a real vision-model call that returns this same shape
 * (location, size, color, ABCDE notes, risk), then diff against `previous`.
 */
export async function analyzeSkinPhoto(
  image: File,
  region: BodyRegion,
  previous?: SkinScan,
): Promise<Lesion[]> {
  void image;
  void region;
  await new Promise((r) => setTimeout(r, 800)); // pretend model latency

  const known = previous?.lesions ?? [];
  const lesions: Lesion[] = known.map((l) => ({ ...l, change: 'stable' as const }));
  lesions.push({
    id: crypto.randomUUID(),
    x: Math.random() * 0.8 + 0.1,
    y: Math.random() * 0.8 + 0.1,
    diameterMm: 2.5,
    color: 'light brown',
    notes: ['new since last scan', 'symmetric'],
    risk: 'watch',
    change: 'new',
  });
  return lesions;
}
