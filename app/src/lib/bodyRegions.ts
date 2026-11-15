import type { BodyRegion, BodySystem } from './types';

/**
 * Clickable regions of the body figure (PRD §5.8). Each region shows one body system
 * plus any skin scans taken in that area.
 */
export type FigureRegionId = 'head' | 'chest' | 'abdomen' | 'right-arm' | 'left-arm' | 'right-leg' | 'left-leg';

export interface FigureRegion {
  id: FigureRegionId;
  label: string;
  system: BodySystem;
  /** Other body systems shown on this part */
  also?: BodySystem[];
  /** Skin-scan regions that belong to this part of the figure */
  skin: BodyRegion[];
}

export const FIGURE_REGIONS: FigureRegion[] = [
  { id: 'head', label: 'Head', system: 'behavioral', also: ['vision'], skin: ['face', 'neck'] },
  { id: 'chest', label: 'Chest', system: 'cardiovascular', skin: ['chest', 'upper-back'] },
  { id: 'abdomen', label: 'Abdomen', system: 'immune', skin: ['abdomen', 'lower-back'] },
  { id: 'right-arm', label: 'Right arm', system: 'musculoskeletal', skin: ['right-arm'] },
  { id: 'left-arm', label: 'Left arm', system: 'musculoskeletal', skin: ['left-arm'] },
  { id: 'right-leg', label: 'Right leg', system: 'musculoskeletal', skin: ['right-leg'] },
  { id: 'left-leg', label: 'Left leg', system: 'musculoskeletal', skin: ['left-leg'] },
];

/**
 * Plain-language description of each body system and what spaceflight does to it.
 * Reference text based on NASA Human Research Program hazard descriptions.
 * TODO: check against sources and cite in docs/SUBMISSION.md.
 */
export const SYSTEM_INFO: Partial<Record<BodySystem, { title: string; does: string; inSpace: string }>> = {
  behavioral: {
    title: 'Brain, sleep and mood',
    does: 'Controls thinking, reaction time, sleep and mood.',
    inSpace: 'Isolation, confinement, a heavy workload and the loss of a normal day and night cycle affect sleep, mood and concentration. These are easier to deal with when caught early.',
  },
  vision: {
    title: 'Eyes',
    does: 'The eyes and the optic nerve carry what you see to the brain.',
    inSpace: 'In weightlessness, body fluid shifts toward the head, and the back of the eye can swell and change shape (NASA calls this SANS). Many astronauts on long missions notice that their near vision gets worse.',
  },
  cardiovascular: {
    title: 'Heart and circulation',
    does: 'The heart and blood vessels carry oxygen to the whole body.',
    inSpace: 'Without gravity, body fluid shifts toward the head and the heart does less work, so the heart and blood vessels slowly change. Oxygen levels also depend on the recycled air in the cabin.',
  },
  immune: {
    title: 'Immune system',
    does: 'Fights infections. A raised temperature is often the first sign that it is busy.',
    inSpace: 'Spaceflight changes how the immune system works, and dormant viruses can become active again. In a sealed habitat an infection spreads easily to the rest of the crew.',
  },
  musculoskeletal: {
    title: 'Muscles and bones',
    does: 'Muscles move the body and bones carry its load.',
    inSpace: 'Muscles and bones carry less load in low gravity and shrink without daily exercise. Bone density cannot be measured in flight, so body mass and exercise are used as early warning signs.',
  },
};
