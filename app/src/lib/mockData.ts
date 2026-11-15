import type { Astronaut, SkinScan, VitalsReading } from './types';

// Placeholder crew + history so the demo has baselines and trends.
// TODO: ground baselines in real NASA data (OSDR / Twins Study / LSDA).

export const crew: Astronaut[] = [
  { id: 'a1', name: 'Cmdr. R. Vega', role: 'Commander', missionDay: 142, radiationMSv: 71 },
  { id: 'a2', name: 'Dr. K. Osei', role: 'Flight Engineer', missionDay: 142, radiationMSv: 68 },
  { id: 'a3', name: 'M. Lindqvist', role: 'Mission Specialist', missionDay: 97, radiationMSv: 49 },
];

function vitalsSeries(id: string, hr: number, sys: number, dia: number, drift = 0): VitalsReading[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 10, 1 + i));
    const wobble = Math.sin(i * 1.3) * 2;
    return {
      astronautId: id,
      takenAt: d.toISOString(),
      heartRate: Math.round(hr + wobble + drift * i),
      systolic: Math.round(sys + wobble + drift * i * 1.5),
      diastolic: Math.round(dia + wobble / 2 + drift * i),
      spo2: 97 + (i % 3 === 0 ? 1 : 0),
    };
  });
}

export const vitals: VitalsReading[] = [
  ...vitalsSeries('a1', 64, 118, 76),
  ...vitalsSeries('a2', 70, 124, 80, 0.9), // trending up → should hit "watch"
  ...vitalsSeries('a3', 61, 112, 72),
];

export const skinScans: SkinScan[] = [
  {
    id: 's1', astronautId: 'a1', region: 'upper-back', takenAt: '2026-11-01T00:00:00Z',
    lesions: [{ id: 'l1', x: 0.4, y: 0.3, diameterMm: 3, color: 'brown', notes: ['symmetric', 'even border'], risk: 'ok', change: 'stable' }],
  },
  {
    id: 's2', astronautId: 'a2', region: 'left-arm', takenAt: '2026-11-10T00:00:00Z',
    lesions: [
      { id: 'l2', x: 0.6, y: 0.5, diameterMm: 6.5, color: 'dark brown / black', notes: ['irregular border', 'grew 1.5 mm since last scan'], risk: 'act', change: 'changed' },
      { id: 'l3', x: 0.2, y: 0.7, diameterMm: 2, color: 'tan', notes: ['new since last scan'], risk: 'watch', change: 'new' },
    ],
  },
];
