import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import type { BodyRegion, Lesion, SkinScan, Source, Status } from './types';

/**
 * Skin-lesion analysis (PRD §5.1).
 *
 * Live mode: sends the photo to Claude (vision) and gets back a structured
 * list of spots. Matching against the previous scan (new / changed / stable)
 * is done here in code, so it is deterministic and explainable.
 *
 * Offline / no key / error: falls back to a mock result labeled "simulated".
 *
 * Not a medical device: the model is told to flag spots for review, never diagnose.
 */

export const MODEL = 'claude-opus-5-5';

/** Live model results count as measured in the app; the fallback is always labeled simulated. */
export type AnalysisSource = Extract<Source, 'measured-in-app' | 'simulated'>;

export interface AnalysisResult {
  lesions: Lesion[];
  source: AnalysisSource;
  /** Why we fell back to simulated, or a note from the model about photo quality */
  message?: string;
}

// ---------- API key (kept in this browser only, never in the build) ----------

const KEY_STORAGE = 'healthlens.anthropicKey';

export function getApiKey(): string | undefined {
  try {
    return localStorage.getItem(KEY_STORAGE) || undefined;
  } catch {
    return undefined;
  }
}

export function setApiKey(key: string | undefined) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    // storage blocked (private window): live mode just won't persist
  }
}

// ---------- Model output schema ----------

const SpotSchema = z.object({
  x: z.number().describe('Horizontal center of the spot as a fraction of image width, 0 = left edge, 1 = right edge'),
  y: z.number().describe('Vertical center of the spot as a fraction of image height, 0 = top edge, 1 = bottom edge'),
  diameterMm: z.number().describe('Estimated largest diameter in millimetres'),
  color: z.string().describe('Short color description, e.g. "light brown", "dark brown", "pink", "black and brown"'),
  asymmetry: z.boolean().describe('A: one half does not match the other'),
  irregularBorder: z.boolean().describe('B: ragged, notched or blurred edge'),
  multipleColors: z.boolean().describe('C: more than one shade or color'),
  notes: z.array(z.string()).describe('Short plain-language observations, max 3'),
  risk: z.enum(['ok', 'watch', 'act']).describe('ok = looks routine; watch = recheck at next scan; act = ask the flight surgeon to review soon'),
});

const ResultSchema = z.object({
  photoUsable: z.boolean().describe('False if the photo is too blurry, dark, or does not show skin'),
  scaleReference: z.boolean().describe('True if a ruler or reference sticker of known size is visible, so sizes are measured rather than guessed'),
  photoNote: z.string().describe('One sentence about photo quality or how to retake it; empty string if fine'),
  spots: z.array(SpotSchema).describe('Every visible mole, freckle, or skin spot'),
});

type ModelResult = z.infer<typeof ResultSchema>;

const SYSTEM = `You help astronauts track skin spots between self-scans on a long space mission.
You are NOT diagnosing. You describe each visible spot so changes can be tracked over time, and you flag spots that a flight surgeon should look at.

For each spot:
- Give its center position as fractions of the image (x across, y down).
- Estimate the largest diameter in mm. If a ruler or reference sticker is visible, measure against it; otherwise estimate from typical skin features and say so via scaleReference=false.
- Check ABC of the ABCDE rule (Asymmetry, Border, Color). Diameter and Evolution are computed by the app from your size and from earlier scans.
- risk: "act" if two or more of A/B/C are present, the spot is over 6 mm, or it looks ulcerated or bleeding; "watch" if exactly one is present; otherwise "ok".
Keep notes short and factual. Never name a disease.
If the photo is unusable, set photoUsable=false, explain in photoNote, and return no spots.`;

// ---------- Main entry ----------

export async function analyzeSkinPhoto(
  image: File,
  region: BodyRegion,
  previous?: SkinScan,
): Promise<AnalysisResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return simulated(previous, 'No API key set: showing a simulated result.');
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return simulated(previous, 'Offline: showing a simulated result. Live analysis needs a connection.');
  }

  try {
    const result = await callModel(apiKey, image, region);
    if (!result.photoUsable) {
      return { lesions: [], source: 'measured-in-app', message: result.photoNote || 'Photo not usable. Please retake.' };
    }
    const lesions = matchToPrevious(result.spots.map(toLesion), previous?.lesions ?? []);
    const notes = [result.photoNote, result.scaleReference ? '' : 'No size reference in frame: sizes are estimates. Add the reference sticker next time.']
      .filter(Boolean)
      .join(' ');
    return { lesions, source: 'measured-in-app', message: notes || undefined };
  } catch (err) {
    return simulated(previous, `Live analysis failed (${describeError(err)}): showing a simulated result.`);
  }
}

async function callModel(apiKey: string, image: File, region: BodyRegion): Promise<ModelResult> {
  // Browser-only app (no backend, PRD §10). The key is typed in by the user and kept in localStorage.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const { data, mediaType } = await toBase64Jpeg(image);

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(ResultSchema) },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: `Body region: ${region}. List every visible skin spot.` },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('the model declined this image');
  }
  if (!response.parsed_output) {
    throw new Error(response.stop_reason === 'max_tokens' ? 'response was cut off' : 'could not read the response');
  }
  return response.parsed_output;
}

function toLesion(s: ModelResult['spots'][number]): Lesion {
  const notes: string[] = [];
  if (s.asymmetry) notes.push('A: asymmetric');
  if (s.irregularBorder) notes.push('B: irregular border');
  if (s.multipleColors) notes.push(MULTI_COLOR);
  if (s.diameterMm > 6) notes.push('D: over 6 mm');
  notes.push(...s.notes.slice(0, 3));
  return {
    id: crypto.randomUUID(),
    x: clamp01(s.x),
    y: clamp01(s.y),
    diameterMm: Math.round(s.diameterMm * 10) / 10,
    color: s.color,
    notes,
    risk: s.risk,
    change: 'new',
  };
}

// ---------- Matching against the previous scan (E: Evolution) ----------

/** Max distance (fraction of image) for two spots to count as the same one. */
const MATCH_RADIUS = 0.12;
/** Growth that counts as "changed": ≥1 mm or ≥20 %. */
const GROWTH_MM = 1;
const GROWTH_PCT = 0.2;
const MULTI_COLOR = 'C: multiple colors';

/**
 * Pair each new spot with the nearest unused spot from the previous scan of the
 * same region. Matched spots keep the old ID, so a spot can be followed over time.
 */
export function matchToPrevious(current: Lesion[], previous: Lesion[]): Lesion[] {
  const pairs: { c: number; p: number; d: number }[] = [];
  current.forEach((c, ci) =>
    previous.forEach((p, pi) => {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d <= MATCH_RADIUS) pairs.push({ c: ci, p: pi, d });
    }),
  );
  pairs.sort((a, b) => a.d - b.d);

  const usedC = new Set<number>();
  const usedP = new Set<number>();
  const out = current.map((l) => ({ ...l, notes: [...l.notes] }));

  for (const { c, p } of pairs) {
    if (usedC.has(c) || usedP.has(p)) continue;
    usedC.add(c);
    usedP.add(p);
    const now = out[c];
    const before = previous[p];
    const grewMm = now.diameterMm - before.diameterMm;
    const grew = grewMm >= GROWTH_MM || grewMm >= before.diameterMm * GROWTH_PCT;
    // Free-text color names vary between calls, so only count a new "multiple colors" flag.
    const recolored = now.notes.includes(MULTI_COLOR) && !before.notes.includes(MULTI_COLOR);
    now.id = before.id;
    if (grew || recolored) {
      now.change = 'changed';
      if (grew) now.notes.unshift(`E: grew ${before.diameterMm} → ${now.diameterMm} mm`);
      if (recolored) now.notes.unshift('E: new color variation');
      now.risk = raise(now.risk, 'watch');
    } else {
      now.change = 'stable';
    }
  }

  for (let i = 0; i < out.length; i++) {
    if (!usedC.has(i) && previous.length > 0) {
      out[i].notes.unshift('new since last scan');
      out[i].risk = raise(out[i].risk, 'watch');
    }
  }
  return out;
}

// ---------- Simulated fallback ----------

async function simulated(previous: SkinScan | undefined, message: string): Promise<AnalysisResult> {
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
  return { lesions, source: 'simulated', message };
}

// ---------- Helpers ----------

/** Downscale to ≤1568 px on the long edge and re-encode as JPEG (keeps requests small). */
async function toBase64Jpeg(file: File): Promise<{ data: string; mediaType: 'image/jpeg' }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1568 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return { data: dataUrl.slice(dataUrl.indexOf(',') + 1), mediaType: 'image/jpeg' };
}

function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return 'API key was rejected';
  if (err instanceof Anthropic.RateLimitError) return 'rate limited, try again shortly';
  if (err instanceof Anthropic.APIConnectionError) return 'could not reach the API';
  if (err instanceof Anthropic.APIError) return `API error ${err.status ?? ''}`.trim();
  return err instanceof Error ? err.message : 'unknown error';
}

const rank: Record<Status, number> = { ok: 0, watch: 1, act: 2 };
const raise = (a: Status, b: Status): Status => (rank[a] >= rank[b] ? a : b);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
