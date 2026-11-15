import type { SkinScan, Status, VitalsReading } from './types';

const rank: Record<Status, number> = { ok: 0, watch: 1, act: 2 };
export const worst = (a: Status, b: Status): Status => (rank[a] >= rank[b] ? a : b);

export interface StatusResult {
  status: Status;
  reasons: string[];
}

// Placeholder thresholds — compare against the astronaut's OWN baseline.
// TODO: tune with NASA / flight-medicine references before the pitch.
export function vitalsStatus(readings: VitalsReading[]): StatusResult {
  if (readings.length < 4) return { status: 'ok', reasons: ['Not enough data for a baseline yet'] };
  const sorted = [...readings].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const base = sorted.slice(0, 3);
  const latest = sorted[sorted.length - 1];
  const avg = (k: keyof VitalsReading) => base.reduce((s, r) => s + (r[k] as number), 0) / base.length;

  const reasons: string[] = [];
  let status: Status = 'ok';
  const hrDelta = latest.heartRate - avg('heartRate');
  const sysDelta = latest.systolic - avg('systolic');

  if (latest.systolic >= 140 || sysDelta >= 15) {
    status = worst(status, 'act');
    reasons.push(`Systolic BP ${latest.systolic} mmHg (+${Math.round(sysDelta)} vs baseline)`);
  } else if (sysDelta >= 8) {
    status = worst(status, 'watch');
    reasons.push(`Systolic BP up ${Math.round(sysDelta)} mmHg vs baseline`);
  }
  if (hrDelta >= 10) {
    status = worst(status, 'watch');
    reasons.push(`Resting HR up ${Math.round(hrDelta)} bpm vs baseline`);
  }
  if (latest.spo2 < 94) {
    status = worst(status, 'act');
    reasons.push(`SpO₂ ${latest.spo2}%`);
  }
  return { status, reasons };
}

export function skinStatus(scans: SkinScan[]): StatusResult {
  const reasons: string[] = [];
  let status: Status = 'ok';
  for (const scan of scans) {
    for (const l of scan.lesions) {
      if (l.risk !== 'ok') {
        status = worst(status, l.risk);
        reasons.push(`${scan.region}: ${l.change} spot, ${l.diameterMm} mm — ${l.notes.join(', ')}`);
      }
    }
  }
  return { status, reasons };
}

export const nextStep: Record<Status, string> = {
  ok: 'No action needed. Keep your regular scan schedule.',
  watch: 'Re-check within 3 days and log any symptoms.',
  act: 'Re-scan today and send the report to the flight surgeon at the next comm window.',
};
