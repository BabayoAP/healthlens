export type Status = 'ok' | 'watch' | 'act';

/** 3D anatomy model: `public/models/body-<type>.glb` */
export type BodyType = 'female' | 'male';

/** Where a value came from (PRD §5.0). `simulated` and `estimated` must always be visibly tagged in the UI. */
export type Source = 'manual' | 'device' | 'self-report' | 'measured-in-app' | 'simulated' | 'estimated';

export type BodySystem =
  | 'cardiovascular' | 'musculoskeletal' | 'behavioral' | 'immune' | 'skin' | 'radiation' | 'vision' | 'metabolic';

/** To add an indicator: add its id here and one entry in `indicators.ts`. Nothing else needs to change. */
export type IndicatorId =
  | 'heartRate' | 'systolic' | 'diastolic' | 'spo2' | 'temperature'
  | 'bodyMass' | 'sleepHours' | 'mood' | 'stress' | 'fatigue'
  | 'reactionTime' | 'nearVision' | 'amsler'
  | 'respRate' | 'glucose';

/** One measured value. Blood pressure is stored as two readings (systolic + diastolic) with the same time. */
export interface Reading {
  id: string;
  astronautId: string;
  indicator: IndicatorId;
  takenAt: string; // ISO date-time
  value: number;
  source: Source;
  /** Device it was imported from (see `devices.ts`), if any */
  device?: string;
}

/** One filled-in symptom checklist (PRD §5.4). An empty list means "no symptoms today". Ids are in `symptoms.ts`. */
export interface SymptomLog {
  id: string;
  astronautId: string;
  takenAt: string; // ISO date-time
  symptoms: string[];
  source: Source;
}

export type BodyRegion =
  | 'face' | 'neck' | 'chest' | 'abdomen' | 'upper-back' | 'lower-back'
  | 'left-arm' | 'right-arm' | 'left-leg' | 'right-leg';

export interface Lesion {
  /** Stable across scans of the same region, so a spot can be tracked over time */
  id: string;
  /** Position within the photo, 0–1 */
  x: number;
  y: number;
  diameterMm: number;
  /** false = size guessed by the model with no reference in frame. Missing = measured (seeded scans). */
  sizeMeasured?: boolean;
  color: string;
  /** ABCDE-style notes from the model */
  notes: string[];
  risk: Status;
  change: 'new' | 'changed' | 'stable';
}

export interface SkinScan {
  id: string;
  astronautId: string;
  region: BodyRegion;
  takenAt: string; // ISO date-time
  imageUrl?: string;
  lesions: Lesion[];
  /** `simulated` for seeded scans and while the analysis is still a mock */
  source: Source;
}

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  missionDay: number;
  radiationMSv: number; // cumulative dose (estimate)
  /** Which 3D anatomy model to show (Body map, Dashboard) */
  body: BodyType;
}
