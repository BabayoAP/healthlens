export type Status = 'ok' | 'watch' | 'act';

export type BodyRegion =
  | 'face' | 'neck' | 'chest' | 'abdomen' | 'upper-back' | 'lower-back'
  | 'left-arm' | 'right-arm' | 'left-leg' | 'right-leg';

export interface Lesion {
  id: string;
  /** Position within the photo, 0–1 */
  x: number;
  y: number;
  diameterMm: number;
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
  takenAt: string; // ISO date
  imageUrl?: string;
  lesions: Lesion[];
}

export interface VitalsReading {
  astronautId: string;
  takenAt: string; // ISO date
  heartRate: number; // bpm
  systolic: number; // mmHg
  diastolic: number; // mmHg
  spo2: number; // %
}

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  missionDay: number;
  radiationMSv: number; // cumulative dose
}
